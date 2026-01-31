import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FORMATS = ['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Pauper'];

const LOADING_MESSAGES = [
  "Aligning ley lines...",
  "Consulting theOracle...",
  "Gathering mana...",
  "Shuffling library...",
  "Sideboarding..."
];

export default function MetaScreen() {
  const [selectedFormat, setSelectedFormat] = useState('Standard');
  const [selectedType, setSelectedType] = useState<'Challenge' | 'League'>('Challenge');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const loadingMessage = useMemo(() => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)], []);

  // ... (rest of imports/state)

  // ... unchanged query logic ...

  // ... dateRangeString logic ...

  // UI RENDER
  // ...
  <Text className="text-zinc-500 font-medium mt-1">
    {isLoading ? loadingMessage : dateRangeString}
  </Text>
  // ...
  {
    selectedType === 'Challenge' ? (
      <>
        <View className="w-16 items-center">
          <Text className="text-zinc-500 font-bold text-xs uppercase">Top 8</Text>
        </View>
        <View className="w-16 items-center">
          <Text className="text-zinc-500 font-bold text-xs uppercase">Overall</Text>
        </View>
      </>
    ) : (
    <View className="w-16 items-center">
      {/* Consolidated Total Column */}
      <Text className="text-zinc-500 font-bold text-xs uppercase">Total</Text>
    </View>
  )
  }
                  </View >
                }
renderItem = {({ item, index }) => (
  <View className="relative flex-row items-center bg-[#1C1C1E] p-4 rounded-xl mb-2">
    {/* ... (Trend/Rank logic unchanged) ... */}

    {/* ... (Name logic unchanged) ... */}

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
      <View className="w-16 items-center">
        <Text className="text-white font-bold text-lg">{(item.frequency * 100).toFixed(0)}%</Text>
      </View>
    )}
  </View>
)}
ListEmptyComponent = {
                  < View className = "items-center py-12" >
  <Text className="text-zinc-500 text-lg">No data found for this period.</Text>
                  </View >
                }
              />
  < Text className = "text-center text-zinc-600 text-xs py-4" >
    Analysis of { snapshot?.eventCount || 0 } events.
              </Text >
            </View >
          )}

{/* Absolute Dropdown Overlay */ }
{
  isFilterVisible && (
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
  )
}
        </View >
      </SafeAreaView >
    </View >
  );
}
