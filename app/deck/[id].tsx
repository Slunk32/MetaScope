import { MtgoService } from '@/services/mtgo';
import { ScryfallService } from '@/services/scryfall';
import { Card } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, SectionList, Text, View } from 'react-native';

export default function DeckDetailScreen() {
    const { id, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => MtgoService.getEvent(eventId!),
        enabled: !!eventId,
    });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <Text>Loading Deck...</Text>
            </View>
        );
    }

    const deck = event?.decks.find((d) => d.id === id);

    if (!deck) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <Text className="text-red-500">Deck not found</Text>
            </View>
        );
    }

    const sections = [
        { title: 'Mainboard', data: deck.mainboard },
        { title: 'Sideboard', data: deck.sideboard },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <Stack.Screen options={{ title: `${deck.player}'s Deck` }} />

            <View className="p-4 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-xl font-bold dark:text-white">{deck.player}</Text>
                <Text className="text-gray-500">{deck.result || 'Participant'}</Text>
                <Text className="text-gray-500">{deck.archetype || 'Unknown Archetype'}</Text>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item, index) => item.name + index}
                renderItem={({ item }) => (
                    <CardRow
                        card={item}
                        onPress={() => setSelectedCard(item.name)}
                    />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="bg-gray-100 px-4 py-2 dark:bg-zinc-800">
                        <Text className="font-bold text-gray-700 dark:text-gray-300">{title}</Text>
                    </View>
                )}
                stickySectionHeadersEnabled={false}
            />

            {/* Simple Card Image Overlay */}
            {selectedCard && (
                <CardPreviewModal
                    cardName={selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </View>
    );
}

function CardRow({ card, onPress }: { card: Card; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} className="flex-row px-4 py-2 border-b border-gray-50 active:bg-blue-50 dark:border-gray-900 dark:active:bg-zinc-900">
            <Text className="w-8 font-bold text-gray-900 dark:text-gray-300">{card.quantity}</Text>
            <Text className="flex-1 text-blue-600 dark:text-blue-400 font-medium underline">{card.name}</Text>
        </Pressable>
    );
}

function CardPreviewModal({ cardName, onClose }: { cardName: string; onClose: () => void }) {
    const { data: imageUrl, isLoading } = useQuery({
        queryKey: ['cardImage', cardName],
        queryFn: () => ScryfallService.getCardImage(cardName),
        enabled: !!cardName,
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
