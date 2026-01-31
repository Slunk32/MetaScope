import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';

export default function MetaScreen() {
  const [selectedFormat, setSelectedFormat] = useState('Standard');
  const [selectedType, setSelectedType] = useState<'Challenge' | 'League'>('Challenge');

  // Fetch Snapshot from Backend (Lazy Cache)
  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: ['meta_analysis', selectedFormat],
    queryFn: async () => {
      // Call our Backend Analysis Endpoint
      // Note: This endpoint handles checking the DB cache or computing the snapshot if needed.
      const response = await fetch(`https://meta-scope-backend.vercel.app/api/meta/analysis?format=${selectedFormat}`);
      if (!response.ok) throw new Error('Failed to fetch meta analysis');
      return response.json();
    },
  });

  const dataList = useMemo(() => {
    if (!snapshot) return [];
    return selectedType === 'League' ? snapshot.leagues : snapshot.challenges;
  }, [snapshot, selectedType]);

  // Format Loading Text
  const loadingText = useMemo(() => {
    return "Checking the oracle..."; // Simple placeholder
  }, []);

  if (error) {
    return (
      <View className="flex-1 bg-[#121212] pt-12 items-center justify-center">
        <Text className="text-red-500 font-bold">Failed to load meta analysis</Text>
        <Text className="text-zinc-500 mt-2">The backend might be warming up.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212] pt-12">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-4 mb-6">
        <Text className="text-3xl font-bold text-white tracking-tight">Weekly Meta</Text>
        <Text className="text-zinc-500 font-medium">
          {snapshot ? `Snapshot from ${new Date(snapshot.generatedAt || Date.now()).toLocaleDateString()}` : 'Loading snapshot...'}
        </Text>
      </View>

      {/* Controls */}
      <View className="px-4 mb-4">
        {/* Format Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
          {['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Pauper'].map(fmt => (
            <Pressable
              key={fmt}
              onPress={() => setSelectedFormat(fmt)}
              className={`mr-3 px-4 py-2 rounded-full border ${selectedFormat === fmt ? 'bg-[#FFBE0B] border-[#FFBE0B]' : 'bg-transparent border-zinc-700'}`}
            >
              <Text className={`font-bold ${selectedFormat === fmt ? 'text-black' : 'text-zinc-400'}`}>
                {fmt}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Type Switcher */}
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
            Aligning ley lines...
          </Text>
          <Text className="text-zinc-700 text-xs mt-2">
            (First load of the day may take a few seconds)
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          <FlatList
            data={dataList || []}
            keyExtractor={(item) => item.name}
            ListHeaderComponent={
              <View className="flex-row justify-between mb-2 px-2">
                <Text className="text-zinc-500 font-bold text-xs uppercase w-6">#</Text>
                <Text className="text-zinc-500 font-bold text-xs uppercase flex-1">Archetype</Text>
                {selectedType === 'Challenge' ? (
                  <>
                    {/* Clarified Headers */}
                    <Text className="text-zinc-500 font-bold text-xs uppercase w-16 text-center">Top 8</Text>
                    <Text className="text-zinc-500 font-bold text-xs uppercase w-16 text-center">Overall</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-zinc-500 font-bold text-xs uppercase w-16 text-center">Count</Text>
                    <Text className="text-zinc-500 font-bold text-xs uppercase w-16 text-center">Freq</Text>
                  </>
                )}
              </View>
            }
            renderItem={({ item, index }) => (
              <View className="flex-row items-center bg-[#1C1C1E] p-4 rounded-xl mb-2">
                <Text className="text-zinc-600 font-bold w-6">{index + 1}</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">
                    {/* Rename Unknown -> Other */}
                    {item.name === 'Unknown' ? 'Other' : item.name}
                  </Text>
                </View>

                {selectedType === 'Challenge' ? (
                  <>
                    <View className="w-16 items-center">
                      {/* Top 8 Stats */}
                      <Text className="text-[#FFBE0B] font-bold text-lg">{item.top8Count}</Text>
                      <Text className="text-zinc-500 text-xs">{(item.top8Share * 100).toFixed(0)}%</Text>
                    </View>
                    <View className="w-16 items-center">
                      {/* Overall Stats - Matched size/weight for alignment */}
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
    </View>
  );
}
