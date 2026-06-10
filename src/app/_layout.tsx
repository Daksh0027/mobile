import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@/components/Icon';
import { PlayerProvider } from '@/context/PlayerContext';
import { LibraryProvider } from '@/context/LibraryContext';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import { Colors, CLERK_PUBLISHABLE_KEY } from '@/constants/config';

// SecureStore token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  },
};

function AppTabs() {
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <PlayerProvider>
      <LibraryProvider>
        <View style={styles.root}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: Colors.textPrimary,
              tabBarInactiveTintColor: Colors.textSecondary,
              tabBarLabelStyle: styles.tabLabel,
              tabBarBackground: () => <View style={styles.tabBg} />,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="search"
              options={{
                title: 'Search',
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="library"
              options={{
                title: 'Your Library',
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons name={focused ? 'library' : 'library-outline'} size={24} color={color} />
                ),
              }}
            />
          </Tabs>

          {/* Mini player sits above the tab bar */}
          <MiniPlayer onPress={() => setPlayerOpen(true)} />

          {/* Full-screen player modal */}
          <FullPlayer visible={playerOpen} onClose={() => setPlayerOpen(false)} />
        </View>
      </LibraryProvider>
    </PlayerProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppTabs />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'android' ? 70 : 85,
    paddingBottom: Platform.OS === 'android' ? 10 : 28,
  },
  tabBg: {
    flex: 1,
    backgroundColor: '#000',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
