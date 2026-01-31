import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  // We force the dark aesthetic now
  const activeTint = '#FFBE0B';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: '#52525b', // Zinc 600
        tabBarStyle: {
          backgroundColor: '#09090b', // Zinc 950/Black
          borderTopWidth: 0,
          height: 80,
          paddingTop: 12,
          paddingBottom: 25, // Adjust for iOS Safe Area implicitly or explicitly
          shadowOpacity: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 4,
          fontWeight: '600',
        },
        headerShown: useClientOnlyValue(false, true),
        // @ts-ignore
        animation: 'none',
        // @ts-ignore
        tabBarAnimationEnabled: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Latest',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-12 h-10 rounded-xl ${focused ? 'bg-[#FFBE0B]' : 'bg-transparent'}`}>
              <FontAwesome name="list" size={18} color={focused ? '#000000' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meta"
        options={{
          title: 'Meta',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-12 h-10 rounded-xl ${focused ? 'bg-[#FFBE0B]' : 'bg-transparent'}`}>
              <FontAwesome name="bar-chart" size={18} color={focused ? '#000000' : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
