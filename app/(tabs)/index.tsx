import { EventCard } from '@/components/EventCard';
import { MtgoService } from '@/services/mtgo';
import { Event } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LatestEventsScreen() {
  const { data, isLoading, error } = useQuery<Event[]>({
    queryKey: ['latestEvents'],
    queryFn: MtgoService.getLatestEvents,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <Text className="text-red-500">Error loading events</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View className="px-4 py-4">
        <Text className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Latest Events
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            id={item.id}
            name={item.name}
            format={item.format}
            date={item.date ? new Date(item.date).toLocaleDateString() : ''}
            type={item.type}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
