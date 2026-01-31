import { LOADING_MESSAGES } from '@/constants/messages';
import { MtgoService } from '@/services/mtgo';
import { Deck } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome'; // Import explicitly for DeckRow
import { useQuery } from '@tanstack/react-query';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', id],
        queryFn: () => MtgoService.getEvent(id!),
        enabled: !!id,
    });

    // Helper to clean up raw names
    const cleanTitle = (rawHost: string) => {
        return rawHost
            .toLowerCase() // Normalize input first to fix "STANDARD Challenge" issues
            .replace(/-/g, ' ')
            .replace(/cpioneer/i, 'Pioneer')
            .replace(/tournament/i, 'Challenge')
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim();
    };

    // Helper to parse info from ID if API data is missing or generic
    const parseInfoFromId = (eventId: string | undefined) => {
        if (!eventId) return { name: 'Event Details', date: '' };

        // Example: modern-challenge-32-2026-01-3012831718
        // Extract Date: 2026-01-30 (regex for YYYY-MM-DD)
        const dateMatch = eventId.match(/(\d{4}-\d{2}-\d{2})/);
        const dateStr = dateMatch ? dateMatch[0] : '';

        // Extract Format/Name: "modern-challenge" -> "Modern Challenge"
        // Remove date and numbers from end
        const namePart = eventId.split(/\d{4}-\d{2}-\d{2}/)[0];
        const humanName = cleanTitle(namePart);

        return {
            name: humanName || 'Event Details',
            date: dateStr
        };
    };

    // Immediate sync parsing for Header Title (before data loads)
    const fallback = parseInfoFromId(id);
    const hasData = !!event;

    // Prefer Event data, fallback to ID parse
    const rawTitle = hasData ? `${event.format} ${event.type}` : `${fallback.name}`;
    const titleText = cleanTitle(rawTitle);

    const isoDate = hasData
        ? new Date(event.date).toISOString().split('T')[0]
        : fallback.date || '';

    // Format YYYY-MM-DD to "MMM Do YYYY" (e.g. "Jan 31st 2025")
    const formatDate = (dateStr: string) => {
        if (!dateStr || !dateStr.includes('-')) return dateStr;
        const [year, month, day] = dateStr.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayNum = parseInt(day, 10);

        let suffix = 'th';
        if (dayNum % 10 === 1 && dayNum !== 11) suffix = 'st';
        else if (dayNum % 10 === 2 && dayNum !== 12) suffix = 'nd';
        else if (dayNum % 10 === 3 && dayNum !== 13) suffix = 'rd';

        return `${months[parseInt(month, 10) - 1]} ${dayNum}${suffix} ${year}`;
    };

    const [activeTab, setActiveTab] = React.useState<'standings' | 'meta' | 'sideboard'>('standings');

    const dateText = formatDate(isoDate);

    // Calculate meta breakdown & Sideboard stats
    const stats = React.useMemo(() => {
        if (!event || !event.decks) return { box: [], top8: [], rest: [], all: [], sideboard: [], isLeague: false };

        const isLeague = titleText.toLowerCase().includes('league');
        const allCounts: Record<string, number> = {};
        const top8Counts: Record<string, number> = {};
        const restCounts: Record<string, number> = {};
        const sbCounts: Record<string, number> = {};

        event.decks.forEach((d, i) => {
            // Archetypes
            const arch = d.archetype || 'Unclassified';
            if (isLeague) {
                allCounts[arch] = (allCounts[arch] || 0) + 1;
            } else {
                if (i < 8) top8Counts[arch] = (top8Counts[arch] || 0) + 1;
                else restCounts[arch] = (restCounts[arch] || 0) + 1;
            }

            // Sideboard Analysis
            d.sideboard.forEach(card => {
                // Skip basics if needed, but usually fine to include
                sbCounts[card.name] = (sbCounts[card.name] || 0) + card.quantity;
            });
        });

        const sortByCount = (a: [string, number], b: [string, number]) => b[1] - a[1];

        return {
            isLeague,
            all: Object.entries(allCounts).sort(sortByCount),
            top8: Object.entries(top8Counts).sort(sortByCount),
            rest: Object.entries(restCounts).sort(sortByCount),
            sideboard: Object.entries(sbCounts).sort(sortByCount).slice(0, 15), // Top 15 SB cards
        };
    }, [event, titleText]);

    // Stack config MUST be rendered before any early returns for it to apply during loading
    const stackConfig = (
        <Stack.Screen
            options={{
                headerTitle: () => (
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl tracking-tight">{titleText}</Text>
                    </View>
                ),
                headerStyle: { backgroundColor: '#121212' },
                headerTintColor: 'white',
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                        <FontAwesome name="chevron-left" size={20} color="#FFBE0B" />
                    </TouchableOpacity>
                ),
                headerBackVisible: false,
                // @ts-ignore: 'animation' is valid in Native Stack but missing in Expo Router types sometimes
                animation: 'none',
            }}
        />
    );

    // Magic Loading Phrases
    const loadingPhrase = React.useMemo(() => {
        return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 bg-[#121212]">
                {stackConfig}
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FFBE0B" />
                    <Text className="text-zinc-500 mt-4 font-medium italic">
                        {loadingPhrase}
                    </Text>
                </View>
            </View>
        );
    }

    if (error || !event) {
        return (
            <View className="flex-1 bg-[#121212]">
                {stackConfig}
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-red-500 font-bold text-lg mb-2">Unavailable</Text>
                    <Text className="text-zinc-500 text-center">
                        {error instanceof Error ? error.message : 'Error loading event details'}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#121212]">
            {stackConfig}
            {/* Solid Background */}
            <View className="absolute left-0 right-0 top-0 h-full bg-[#121212]" />

            {/* Header Info */}
            <View className="px-4 py-4 bg-[#121212]">
                <View className="flex-row items-baseline justify-between">
                    <Text className="text-lg text-zinc-400 font-medium">
                        {dateText}
                    </Text>
                </View>
            </View>

            {/* Tab Selector */}
            <View className="flex-row border-b border-zinc-800 mb-4 mx-4">
                <Pressable
                    onPress={() => setActiveTab('standings')}
                    className={`pb-3 mr-6 ${activeTab === 'standings' ? 'border-b-2 border-[#FFBE0B]' : ''}`}>
                    <Text className={`text-base font-bold ${activeTab === 'standings' ? 'text-[#FFBE0B]' : 'text-zinc-500'}`}>
                        Standings
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('meta')}
                    className={`pb-3 mr-6 ${activeTab === 'meta' ? 'border-b-2 border-[#FFBE0B]' : ''}`}>
                    <Text className={`text-base font-bold ${activeTab === 'meta' ? 'text-[#FFBE0B]' : 'text-zinc-500'}`}>
                        Meta Breakdown
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('sideboard')}
                    className={`pb-3 ${activeTab === 'sideboard' ? 'border-b-2 border-[#FFBE0B]' : ''}`}>
                    <Text className={`text-base font-bold ${activeTab === 'sideboard' ? 'text-[#FFBE0B]' : 'text-zinc-500'}`}>
                        Sideboard Trends
                    </Text>
                </Pressable>
            </View>

            {/* Content Area */}
            {activeTab === 'standings' ? (
                <FlatList
                    data={event.decks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <DeckRow deck={item} eventId={event.id} />}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                />
            ) : activeTab === 'meta' ? (
                <View className="flex-1 px-4">
                    <FlatList
                        data={[]}
                        renderItem={({ item }) => null /* dummy */}
                        ListHeaderComponent={
                            <View className="pb-8">
                                {stats.isLeague ? (
                                    /* League View: Single Consolidated List */
                                    <View className="bg-[#1C1C1E] p-4 rounded-2xl">
                                        <Text className="text-xl font-bold text-white mb-4">🏆 League Meta (5-0)</Text>
                                        {stats.all.map(([arch, count]) => (
                                            <View key={arch} className="flex-row items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                                                <Text className="text-zinc-200 font-medium text-base">{arch}</Text>
                                                <View className="bg-[#2C2C2E] px-3 py-1 rounded-full">
                                                    <Text className="text-white font-bold">{count}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    /* Challenge View: Top 8 Split */
                                    <>
                                        {/* Top 8 Section */}
                                        {stats.top8.length > 0 && (
                                            <View className="mb-6 bg-[#1C1C1E] p-4 rounded-2xl">
                                                <Text className="text-xl font-bold text-white mb-4">🏆 Top 8 Meta</Text>
                                                {stats.top8.map(([arch, count]) => (
                                                    <View key={arch} className="flex-row items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                                                        <View className="flex-row items-center">
                                                            {/* Removed rank numbering */}
                                                            <Text className="text-zinc-200 font-medium text-base">{arch}</Text>
                                                        </View>
                                                        <View className="bg-[#2C2C2E] px-3 py-1 rounded-full">
                                                            <Text className="text-[#FFBE0B] font-bold">{count}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}

                                        {/* Rest of Field Section */}
                                        {stats.rest.length > 0 && (
                                            <View className="bg-[#1C1C1E] p-4 rounded-2xl">
                                                <Text className="text-xl font-bold text-white mb-4">📊 Rest of Field</Text>
                                                {stats.rest.map(([arch, count]) => (
                                                    <View key={arch} className="flex-row items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                                                        <Text className="text-zinc-200 font-medium text-base">{arch}</Text>
                                                        <View className="bg-[#2C2C2E] px-3 py-1 rounded-full">
                                                            <Text className="text-white font-bold">{count}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        }
                    />
                </View>
            ) : (
                /* Sideboard Frequency Tab */
                <View className="flex-1 px-4">
                    <FlatList
                        data={[]}
                        renderItem={({ item }) => null /* dummy */}
                        ListHeaderComponent={
                            <View className="bg-[#1C1C1E] p-4 rounded-2xl mb-8">
                                <Text className="text-xl font-bold text-white mb-4">🛡️ Sideboard Trends</Text>
                                <Text className="text-zinc-500 mb-4 italic">
                                    {stats.isLeague
                                        ? "Most played cards in this day's league."
                                        : "Most played cards in sideboards for this event."}
                                </Text>
                                {stats.sideboard.map(([card, count], index) => (
                                    <View key={card} className="flex-row items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                                        <View className="flex-row items-center flex-1">
                                            <Text className="text-zinc-500 w-6 font-bold mr-2">{index + 1}.</Text>
                                            <Text className="text-zinc-200 font-medium text-base flex-1">{card}</Text>
                                        </View>
                                        <View className="bg-[#2C2C2E] px-3 py-1 rounded-full">
                                            <Text className="text-white font-bold">{count}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        }
                    />
                </View>
            )}
        </View>
    );
}

function DeckRow({ deck, eventId }: { deck: Deck; eventId: string }) {
    // Simple color inference for MVP visual
    const colors = inferColors(deck);

    return (
        <Link href={`/deck/${deck.id}?eventId=${eventId}`} asChild>
            <Pressable className="flex-row items-center bg-[#1C1C1E] rounded-2xl px-4 py-4 mb-3 active:scale-98 transition-all shadow-sm">
                <View className="mr-4 w-12 items-center justify-center">
                    <Text className="font-bold text-white text-lg">{deck.result || '-'}</Text>
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-white text-base">
                        {deck.player}
                    </Text>
                    <Text className="text-sm text-zinc-400 font-medium">
                        {deck.archetype || 'Unclassified'}
                    </Text>
                </View>
                <View className="flex-row gap-1">
                    {colors.map((c, i) => (
                        <View key={i} className={`h-3 w-3 rounded-full ${getColorClass(c)}`} />
                    ))}
                </View>
                <View className="ml-2">
                    <FontAwesome name="chevron-right" size={12} color="#52525b" />
                </View>
            </Pressable>
        </Link>
    );
}

// Helper to guess colors from card costs (very basic)
// Need to update types/backend to actually get this data

function inferColors(deck: Deck): string[] {
    return []; // MVP: No color data available in frontend yet
}

function getColorClass(color: string) {
    return 'bg-gray-400';
}
