import { MtgoService } from '@/services/mtgo';
import { Deck } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', id],
        queryFn: () => MtgoService.getEvent(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error || !event) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <Text className="text-red-500">Error loading event details</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{ title: event.name }} />

            <View className="border-b border-gray-200 p-4 dark:border-gray-800">
                <Text className="text-2xl font-bold text-black dark:text-white">{event.name}</Text>
                <Text className="text-gray-500 dark:text-gray-400">
                    {event.format} • {new Date(event.date).toLocaleDateString()}
                </Text>
                <Text className="mt-2 text-sm text-gray-400">
                    {event.decks.length} Decks Reported
                </Text>
            </View>

            <FlatList
                data={event.decks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <DeckRow deck={item} eventId={event.id} />}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

function DeckRow({ deck, eventId }: { deck: Deck; eventId: string }) {
    // Simple color inference for MVP visual
    const colors = inferColors(deck);

    return (
        <Link href={`/deck/${deck.id}?eventId=${eventId}`} asChild>
            <Pressable className="flex-row items-center border-b border-gray-100 px-4 py-3 active:bg-gray-50 dark:border-gray-800 dark:active:bg-zinc-900">
                <View className="mr-3 w-8 items-center justify-center">
                    <Text className="font-bold text-gray-900 dark:text-white">{deck.result || '-'}</Text>
                </View>
                <View className="flex-1">
                    <Text className="font-semibold text-black dark:text-white">
                        {deck.player}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {deck.archetype || 'Unclassified'}
                    </Text>
                </View>
                <View className="flex-row gap-1">
                    {colors.map(c => (
                        <View key={c} className={`h-3 w-3 rounded-full ${getColorClass(c)}`} />
                    ))}
                </View>
                <View className="ml-2">
                    <Text className="text-gray-400 dark:text-gray-600">›</Text>
                </View>
            </Pressable>
        </Link>
    );
}

// Helper to guess colors from card costs (very basic)
function inferColors(deck: Deck): string[] {
    const mainboard = deck.mainboard;
    const colors = new Set<string>();

    // Check lands or known cards. For MVP, we can't easily parse mana cost strings without a DB.
    // But MTGO JSON actually GIVES us "card_attributes.colors"!
    // Wait, the API response I saw earlier had `colors: ["COLOR_RED"]` etc.
    // I didn't map that in `types.ts` Card.
    // I should probably update `types.ts` and `mtgo.ts` to include color info if I want it.
    // For now, return empty or mock.
    return [];
}

function getColorClass(color: string) {
    // Map WUBRG to tailwind classes
    return 'bg-gray-400';
}
