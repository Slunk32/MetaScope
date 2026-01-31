import { EventCard } from '@/components/EventCard';
import { MtgoService } from '@/services/mtgo';
import { Event } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FORMATS = ['All', 'Modern', 'Pioneer', 'Legacy', 'Vintage', 'Pauper', 'Standard'];

export default function LatestEventsScreen() {
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { data, isLoading, error } = useQuery<Event[]>({
    queryKey: ['latestEvents'],
    queryFn: MtgoService.getLatestEvents,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedFormat === 'All') return data;
    return data.filter((e) => e.format === selectedFormat);
  }, [data, selectedFormat]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-red-500">Error loading events</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />

      {/* Solid Background (No Gradient) */}
      <View className="absolute left-0 right-0 top-0 h-full bg-[#121212]" />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* z-10 Container ensuring content is below dropdown */}
        <View className="relative flex-1 z-10">
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View className="px-4 py-4 z-20">
                <Pressable
                  onPress={() => setIsFilterVisible(!isFilterVisible)}
                  className="flex-row items-center active:opacity-60"
                >
                  <Text className="text-3xl font-extrabold tracking-tight text-white mr-2">
                    Latest Events: <Text className="text-zinc-400">{selectedFormat}</Text>
                  </Text>
                  <FontAwesome name={isFilterVisible ? "chevron-up" : "chevron-down"} size={18} color="#a1a1aa" style={{ marginTop: 6 }} />
                </Pressable>
              </View>
            }
            renderItem={({ item }) => (
              <EventCard
                id={item.id}
                name={item.name}
                format={item.format}
                date={item.date} // Service now returns YYYY-MM-DD string
                type={item.type}
              />
            )}
          />

          {/* Absolute Dropdown Overlay */}
          {isFilterVisible && (
            <>
              {/* Full screen invisible pressable to close when clicking outside */}
              <Pressable
                className="absolute top-0 bottom-0 left-0 right-0 bg-transparent z-30" // bg-transparent or bg-black/50 if dimming needed
                onPress={() => setIsFilterVisible(false)}
              />

              {/* Dropdown Menu */}
              <View className="absolute top-20 left-4 right-4 bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-2xl border border-white/5 z-50">
                <View className="py-2">
                  {FORMATS.map((fmt, index) => (
                    <Pressable
                      key={fmt}
                      onPress={() => {
                        setSelectedFormat(fmt);
                        setIsFilterVisible(false); // Snap close
                      }}
                      className={`flex-row items-center justify-between px-6 py-5 active:bg-white/5 ${index !== FORMATS.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                    >
                      <View className="flex-row items-center gap-4">
                        <View className="w-6 items-center">
                          {selectedFormat === fmt && (
                            <FontAwesome name="check" size={16} color="#4ade80" />
                          )}
                        </View>
                        <Text className={`text-xl ${selectedFormat === fmt ? 'font-bold text-white' : 'font-medium text-zinc-400'}`}>
                          {fmt}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
