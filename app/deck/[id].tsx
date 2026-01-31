import { MtgoService } from '@/services/mtgo';
import { ScryfallService } from '@/services/scryfall';
import { Card } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, SectionList, Text, TouchableOpacity, View } from 'react-native';

export default function DeckDetailScreen() {
    const { id, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
    const router = useRouter();
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => MtgoService.getEvent(eventId!),
        enabled: !!eventId,
    });

    const deck = event?.decks.find((d) => d.id === id);

    // Immediate Header Config
    const headerTitle = deck ? `${deck.player}'s Deck` : 'Deck Details';

    // Consistent stack config to prevent layout shifts/snaps
    const stackConfig = (
        <Stack.Screen
            options={{
                title: headerTitle,
                headerStyle: { backgroundColor: '#121212' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
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

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#121212]">
                {stackConfig}
                <ActivityIndicator size="large" color="#FFBE0B" />
            </View>
        );
    }

    if (!deck) {
        return (
            <View className="flex-1 items-center justify-center bg-[#121212]">
                {stackConfig}
                <Text className="text-red-500">Deck not found</Text>
            </View>
        );
    }

    // State for card metadata (type_line and image_uri)
    const [cardData, setCardData] = useState<Record<string, { type: string, image: string | null }>>({});
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');

    // Helper to extract image
    const extractImage = (c: any): string | null => {
        if (c.image_uris?.normal) return c.image_uris.normal;
        if (c.card_faces?.[0]?.image_uris?.normal) return c.card_faces[0].image_uris.normal;
        return null;
    };

    // Fetch card types when deck is loaded
    useEffect(() => {
        if (!deck) return;

        const fetchTypes = async () => {
            setIsLoadingTypes(true);
            const names = [
                ...deck.mainboard.map(c => c.name),
                ...deck.sideboard.map(c => c.name)
            ];
            const cards = await ScryfallService.getCards(names);

            const map: Record<string, { type: string, image: string | null }> = {};
            cards.forEach((c: any) => {
                const name = c.name.split(' //')[0];
                const data = { type: c.type_line, image: extractImage(c) };
                map[c.name] = data;
                map[name] = data;
            });
            setCardData(map);
            setIsLoadingTypes(false);
        };

        fetchTypes();
    }, [deck]);

    // Sorting Logic with Chunking
    const getSortedSections = () => {
        if (!deck) return [];

        const creatures: Card[] = [];
        const lands: Card[] = [];
        const artifacts: Card[] = [];
        const enchantments: Card[] = [];
        const planeswalkers: Card[] = [];
        const spells: Card[] = [];
        const sideboard: Card[] = deck.sideboard;

        deck.mainboard.forEach(card => {
            const info = cardData[card.name];
            const type = info?.type || '';

            if (type.includes('Land')) {
                lands.push(card);
            } else if (type.includes('Creature')) {
                creatures.push(card);
            } else if (type.includes('Planeswalker')) {
                planeswalkers.push(card);
            } else if (type.includes('Artifact')) {
                artifacts.push(card);
            } else if (type.includes('Enchantment')) {
                enchantments.push(card);
            } else {
                spells.push(card);
            }
        });

        // 2 columns for list, 3 for visual
        const chunkSize = viewMode === 'visual' ? 3 : 2;

        const chunk = (arr: Card[], size: number) => {
            const result = [];
            for (let i = 0; i < arr.length; i += size) {
                result.push(arr.slice(i, i + size));
            }
            return result;
        };

        const sections = [];
        if (creatures.length > 0) sections.push({ title: `Creatures (${countCards(creatures)})`, data: chunk(creatures, chunkSize) });
        if (planeswalkers.length > 0) sections.push({ title: `Planeswalkers (${countCards(planeswalkers)})`, data: chunk(planeswalkers, chunkSize) });
        if (artifacts.length > 0) sections.push({ title: `Artifacts (${countCards(artifacts)})`, data: chunk(artifacts, chunkSize) });
        if (enchantments.length > 0) sections.push({ title: `Enchantments (${countCards(enchantments)})`, data: chunk(enchantments, chunkSize) });
        if (spells.length > 0) sections.push({ title: `Spells (${countCards(spells)})`, data: chunk(spells, chunkSize) });
        if (lands.length > 0) sections.push({ title: `Lands (${countCards(lands)})`, data: chunk(lands, chunkSize) });
        if (sideboard.length > 0) sections.push({ title: `Sideboard (${countCards(sideboard)})`, data: chunk(sideboard, chunkSize) });

        return sections;
    };

    const countCards = (cards: Card[]) => cards.reduce((acc, c) => acc + c.quantity, 0);
    const sections = getSortedSections();

    return (
        <View className="flex-1 bg-[#121212]">
            {stackConfig}

            {/* Toggle Header */}
            <View className="flex-row justify-between items-center px-4 py-2 border-b border-white/5 bg-[#1C1C1E]">
                <Text className="text-zinc-400 font-medium text-xs tracking-wide">
                    {viewMode === 'list' ? 'TEXT VIEW' : 'VISUAL VIEW'}
                </Text>
                <View className="flex-row bg-[#2C2C2E] rounded-lg p-0.5">
                    <Pressable
                        onPress={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md ${viewMode === 'list' ? 'bg-[#3A3A3C]' : 'bg-transparent'}`}
                    >
                        <FontAwesome name="list" size={14} color={viewMode === 'list' ? '#FFBE0B' : '#8E8E93'} />
                    </Pressable>
                    <Pressable
                        onPress={() => setViewMode('visual')}
                        className={`px-3 py-1.5 rounded-md ${viewMode === 'visual' ? 'bg-[#3A3A3C]' : 'bg-transparent'}`}
                    >
                        <FontAwesome name="th-large" size={14} color={viewMode === 'visual' ? '#FFBE0B' : '#8E8E93'} />
                    </Pressable>
                </View>
            </View>

            {isLoadingTypes ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#FFBE0B" />
                    <Text className="text-zinc-500 mt-2 text-xs">Sorting deck...</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => item[0].name + index}
                    renderItem={({ item }) => (
                        <View className="flex-row px-2">
                            {item.map((card: Card, i: number) => (
                                <View key={i} className="flex-1 p-1">
                                    {viewMode === 'list' ? (
                                        <CardRow
                                            card={card}
                                            onPress={() => setSelectedCard(card.name)}
                                        />
                                    ) : (
                                        <CardVisual
                                            card={card}
                                            imageUrl={cardData[card.name]?.image}
                                            onPress={() => setSelectedCard(card.name)}
                                        />
                                    )}
                                </View>
                            ))}
                            {/* Fill empty slots in row */}
                            {[...Array((viewMode === 'visual' ? 3 : 2) - item.length)].map((_, i) => (
                                <View key={`empty-${i}`} className="flex-1 p-1" />
                            ))}
                        </View>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View className="bg-[#121212] px-4 py-2 mt-2 border-b border-white/5">
                            <Text className="font-bold text-[#FFBE0B] uppercase tracking-wider text-xs">{title}</Text>
                        </View>
                    )}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            {/* Simple Card Image Overlay */}
            {selectedCard && (
                <CardPreviewModal
                    cardName={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    // Pass image directly if available to skip loading
                    initialImage={cardData[selectedCard]?.image}
                />
            )}
        </View>
    );
}


function CardRow({ card, onPress }: { card: Card; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} className="flex-row py-3 border-b border-white/5 active:bg-white/10 items-center">
            <Text className="w-6 font-bold text-zinc-400 text-right mr-2 text-xs">{card.quantity}</Text>
            <Text className="flex-1 text-white font-medium text-xs" numberOfLines={1}>{card.name}</Text>
        </Pressable>
    );
}

function CardVisual({ card, imageUrl, onPress }: { card: Card; imageUrl?: string | null; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} className="aspect-[2.5/3.5] relative active:opacity-80">
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-full rounded-md"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-full bg-[#1C1C1E] rounded-md items-center justify-center p-1">
                    <Text className="text-zinc-500 text-[10px] text-center">{card.name}</Text>
                </View>
            )}
            {/* Quantity Badge */}
            {card.quantity > 0 && (
                <View className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded">
                    <Text className="text-white text-[10px] font-bold">x{card.quantity}</Text>
                </View>
            )}
        </Pressable>
    );
}

function CardPreviewModal({ cardName, onClose, initialImage }: { cardName: string; onClose: () => void; initialImage?: string | null }) {
    const { data: imageUrl, isLoading } = useQuery({
        queryKey: ['cardImage', cardName],
        queryFn: () => ScryfallService.getCardImage(cardName),
        enabled: !!cardName && !initialImage, // Only fetch if we don't have it
        initialData: initialImage // Use what we already have
    });

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 bg-black/80 items-center justify-center p-4" onPress={onClose}>
                <View className="bg-transparent rounded-xl overflow-hidden shadow-2xl" onStartShouldSetResponder={() => true}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="white" />
                    ) : imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={{ width: 300, height: 418 }}
                            resizeMode="contain"
                        />
                    ) : (
                        <View className="bg-white p-4 rounded text-center">
                            <Text>Image not found</Text>
                        </View>
                    )}
                </View>
            </Pressable>
        </Modal>
    );
}
