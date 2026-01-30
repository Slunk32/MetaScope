import { MtgoService } from '@/services/mtgo';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FORMATS = ['Modern', 'Pioneer', 'Legacy', 'Standard'];

export default function MetaScreen() {
  const [selectedFormat, setSelectedFormat] = useState('Modern');

  // 1. Fetch all recent events
  const { data: eventsList, isLoading: isLoadingList } = useQuery({
    queryKey: ['latestEvents'],
    queryFn: MtgoService.getLatestEvents,
  });

  // 2. Find the latest event for the selected format
  const latestEventShort = useMemo(() => {
    if (!eventsList) return null;
    return eventsList.find(e => e.format === selectedFormat);
  }, [eventsList, selectedFormat]);

  // 3. Fetch details for that specific event (to get decks)
  const { data: fullEvent, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', latestEventShort?.id],
    queryFn: () => MtgoService.getEvent(latestEventShort!.id),
    enabled: !!latestEventShort?.id,
  });

  // 4. Aggregate Archetypes
  const stats = useMemo(() => {
    if (!fullEvent || !fullEvent.decks) return [];

    const totalDecks = fullEvent.decks.length;
    const counts: Record<string, number> = {};

    fullEvent.decks.forEach(d => {
      const arch = d.archetype || 'Unclassified';
      counts[arch] = (counts[arch] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: (count / totalDecks) * 100,
      }))
      .sort((a, b) => b.count - a.count); // Sort by prevalence
  }, [fullEvent]);

  const isLoading = isLoadingList || (latestEventShort && isLoadingEvent);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
      <View className="px-4 py-4">
        <Text className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Metagame
        </Text>
      </View>

      {/* Format Filter */}
      <View className="px-4 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {FORMATS.map(fmt => (
            <TouchableOpacity
              key={fmt}
              onPress={() => setSelectedFormat(fmt)}
              className={`px-4 py-2 rounded-full border ${selectedFormat === fmt
                  ? 'bg-black border-black dark:bg-white dark:border-white'
                  : 'bg-transparent border-gray-300 dark:border-gray-700'
                }`}
            >
              <Text className={`font-semibold ${selectedFormat === fmt
                  ? 'text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400'
                }`}>
                {fmt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : !latestEventShort ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 text-center">No recent events found for {selectedFormat}.</Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          <View className="mb-4 p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
            <Text className="text-sm text-gray-400 uppercase font-bold">Based on latest event</Text>
            <Text className="text-lg font-bold text-black dark:text-white">{latestEventShort.name}</Text>
            <Text className="text-gray-500 text-xs">{new Date(latestEventShort.date).toLocaleDateString()}</Text>
          </View>

          <FlatList
            data={stats}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <View className="mb-3 flex-row items-center">
                <View className="flex-1">
                  <View className="flex-row justify-between mb-1">
                    <Text className="font-semibold text-gray-900 dark:text-white">{item.name}</Text>
                    <Text className="text-gray-500 dark:text-gray-400">
                      {item.count} ({item.percent.toFixed(1)}%)
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-500 dark:bg-blue-400"
                      style={{ width: `${item.percent}%` }}
                    />
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
