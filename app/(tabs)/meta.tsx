import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FORMATS = ['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Pauper'];

export default function MetaScreen() {
  const [selectedFormat, setSelectedFormat] = useState('Standard');
  const [selectedType, setSelectedType] = useState<'Challenge' | 'League'>('Challenge');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Fetch Snapshot from Backend (Lazy Cache)
  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: ['meta_analysis', selectedFormat],
    queryFn: async () => {
      // Append timestamp to bypass Vercel Edge Cache for debugging
      const response = await fetch(`https://meta-scope-backend.vercel.app/api/meta/analysis?format=${selectedFormat}&_t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch meta analysis');
      return response.json();
    },
  });

  const dataList = useMemo(() => {
    if (!snapshot) return [];
    return selectedType === 'League' ? snapshot.leagues : snapshot.challenges;
  }, [snapshot, selectedType]);

  // Calculate Date Range
  const dateRangeString = useMemo(() => {
    const end = snapshot?.generatedAt ? new Date(snapshot.generatedAt) : new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 7);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `From ${start.toLocaleDateString('en-US', options)} to ${end.toLocaleDateString('en-US', options)}`;
  }, [snapshot]);

  if (error) {
    return (
      <View className="flex-1 bg-[#121212] pt-12 items-center justify-center">
        <Text className="text-red-500 font-bold">Failed to load meta analysis</Text>
        <Text className="text-zinc-500 mt-2">The backend might be warming up.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="relative flex-1 z-10">

          {/* Header with Dropdown */}
          <View className="px-4 py-4 z-20 bg-[#121212]">
            <Pressable
              onPress={() => setIsFilterVisible(!isFilterVisible)}
              className="flex-row items-center active:opacity-60"
            >
              <Text className="text-3xl font-extrabold tracking-tight text-white mr-2">
                Weekly Meta: <Text className="text-zinc-400">{selectedFormat}</Text>
              </Text>
              <FontAwesome name={isFilterVisible ? "chevron-up" : "chevron-down"} size={18} color="#a1a1aa" style={{ marginTop: 6 }} />
            </Pressable>
            <Text className="text-zinc-500 font-medium mt-1">
              {isLoading ? 'Aligning ley lines...' : dateRangeString}
            </Text>
          </View>

          {/* Controls (Type Switcher Only) */}
          <View className="px-4 mb-4 z-10 bg-[#121212]">
            <View className="flex-row bg-[#1C1C1E] p-1 rounded-xl">
              {(['Challenge', 'League'] as const).map(type => (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  className={`flex-1 py-3 rounded-lg items-center ${selectedType === type ? 'bg-[#2C2C2E]' : 'bg-transparent'}`}
                >
                  <Text className={`font-bold ${selectedType === type ? 'text-white' : 'text-zinc-500'}`}>
                    {type}s
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FFBE0B" />
              <Text className="text-zinc-500 mt-4 italic">
                Checking the oracle...
              </Text>
            </View>
          ) : (
            <View className="flex-1">
              <FlatList
                data={dataList || []}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                ListHeaderComponent={
                  <View className="flex-row justify-between mb-2 px-2">
                    {/* Rank Column - Fixed Width */}
                    <Text className="text-zinc-500 font-bold text-xs uppercase w-12 text-center">#</Text>
                    <Text className="text-zinc-500 font-bold text-xs uppercase flex-1">Archetype</Text>
                    {selectedType === 'Challenge' ? (
                      <>
                        <View className="w-16 items-center">
                          <Text className="text-zinc-500 font-bold text-xs uppercase">Top 8</Text>
                        </View>
                        <View className="w-16 items-center">
                          <Text className="text-zinc-500 font-bold text-xs uppercase">Overall</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View className="w-16 items-center">
                          <Text className="text-zinc-500 font-bold text-xs uppercase">Count</Text>
                        </View>
                        <View className="w-16 items-center">
                          <Text className="text-zinc-500 font-bold text-xs uppercase">Freq</Text>
                        </View>
                      </>
                    )}
                  </View>
                }
                renderItem={({ item, index }) => (
                  <View className="flex-row items-center bg-[#1C1C1E] p-4 rounded-xl mb-2">
                    {/* Rank & Trend (Absolute Layout) */}
                    <View className="w-12 relative items-center justify-center mr-2">
                      {/* Trend Indicator (Absolute Left) */}
                      {item.rankDiff > 0 && (
                        <View className="absolute left-0 items-center -mt-1">
                          <FontAwesome name="caret-up" size={10} color="#4ade80" />
                          <Text className="text-[#4ade80] text-[7px] font-bold">{Math.abs(item.rankDiff)}</Text>
                        </View>
                      )}
                      {item.rankDiff < 0 && (
                        <View className="absolute left-0 items-center -mt-1">
                          <FontAwesome name="caret-down" size={10} color="#f87171" />
                          <Text className="text-[#f87171] text-[7px] font-bold">{Math.abs(item.rankDiff)}</Text>
                        </View>
                      )}

                      {/* Rank Number (Centered) */}
                      <Text className="text-zinc-600 font-bold text-lg leading-6">{index + 1}</Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-white font-bold text-base">
                        {item.name === 'Unknown' ? 'Other' : item.name}
                      </Text>
                    </View>

                    {selectedType === 'Challenge' ? (
                      <>
                        <View className="w-16 items-center">
                          <Text className="text-[#FFBE0B] font-bold text-lg">{item.top8Count}</Text>
                          <Text className="text-zinc-500 text-xs">{(item.top8Share * 100).toFixed(0)}%</Text>
                        </View>
                        <View className="w-16 items-center">
                          <Text className="text-zinc-300 font-bold text-lg">{item.count}</Text>
                          <Text className="text-zinc-500 text-xs">{(item.metaShare * 100).toFixed(0)}%</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View className="bg-[#2C2C2E] px-3 py-1 rounded-full w-16 items-center">
                          <Text className="text-white font-bold">{item.count}</Text>
                        </View>
                        <View className="w-16 items-center">
                          <Text className="text-zinc-500 text-xs">{(item.frequency * 100).toFixed(0)}%</Text>
                        </View>
                      </>
                    )}
                  </View>
                )}
                ListEmptyComponent={
                  <View className="items-center py-12">
                    <Text className="text-zinc-500 text-lg">No data found for this period.</Text>
                  </View>
                }
              />
              <Text className="text-center text-zinc-600 text-xs py-4">
                Analysis of {snapshot?.eventCount || 0} events.
              </Text>
            </View>
          )}

          {/* Absolute Dropdown Overlay */}
          {isFilterVisible && (
            <>
              <Pressable
                className="absolute top-0 bottom-0 left-0 right-0 bg-transparent z-30"
                onPress={() => setIsFilterVisible(false)}
              />

              <View className="absolute top-20 left-4 right-4 bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-2xl border border-white/5 z-50">
                <View className="py-2">
                  {FORMATS.map((fmt, index) => (
                    <Pressable
                      key={fmt}
                      onPress={() => {
                        setSelectedFormat(fmt);
                        setIsFilterVisible(false);
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
