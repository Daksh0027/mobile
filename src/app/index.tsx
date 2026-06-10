import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { Colors } from '@/constants/config';
import { useHome } from '@/hooks/useHome';
import { usePlayer } from '@/context/PlayerContext';
import QuickPickCard from '@/components/QuickPickCard';
import Shelf from '@/components/Shelf';
import type { Track } from '@/types';

const FILTER_PILLS = ['All', 'Music', 'Podcasts'];

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { topTracks, topMixes, recommendedStations, isLoading, refresh } = useHome();
  const { playSong, currentTrack, isPlaying } = usePlayer();
  const [activeFilter, setActiveFilter] = useState('All');

  const avatarLetter = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'G';
  const avatarUrl = user?.imageUrl;

  const handlePlay = (track: Track, queue: Track[]) => {
    playSong(track, queue);
  };

  // 2-column grid from topTracks (max 8)
  const gridTracks = topTracks.slice(0, 8);
  const rows = [];
  for (let i = 0; i < gridTracks.length; i += 2) {
    rows.push([gridTracks[i], gridTracks[i + 1]].filter(Boolean));
  }

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={Colors.green} />
          }
        >
          {/* === Top bar === */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={isSignedIn ? undefined : () => openSignIn()}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarLetter}>{avatarLetter.toUpperCase()}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.pills}>
              {FILTER_PILLS.map(pill => (
                <TouchableOpacity
                  key={pill}
                  style={[styles.pill, activeFilter === pill && styles.pillActive]}
                  onPress={() => setActiveFilter(pill)}
                >
                  <Text style={[styles.pillText, activeFilter === pill && styles.pillTextActive]}>
                    {pill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={Colors.green} />
            </View>
          ) : (
            <>
              {/* === Quick picks 2-col grid === */}
              <View style={styles.grid}>
                {rows.map((row, ri) => (
                  <View key={ri} style={styles.gridRow}>
                    {row.map(track => (
                      <QuickPickCard
                        key={track.id}
                        track={track}
                        isPlaying={isPlaying && currentTrack?.id === track.id}
                        onPress={() => handlePlay(track, topTracks)}
                      />
                    ))}
                  </View>
                ))}
              </View>

              {/* === Shelves === */}
              <Shelf
                title="Your top mixes"
                tracks={topMixes}
                onTrackPress={t => handlePlay(t, topMixes)}
                currentTrackId={currentTrack?.id}
              />

              <Shelf
                title="Recommended Stations"
                tracks={recommendedStations}
                onTrackPress={t => handlePlay(t, recommendedStations)}
                currentTrackId={currentTrack?.id}
              />

              {/* Bottom padding for mini player */}
              <View style={{ height: 80 }} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  safe: { flex: 1 },
  scroll: { paddingBottom: 8 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: '#e13300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
  },
  pillActive: {
    backgroundColor: Colors.green,
  },
  pillText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  loader: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  grid: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 28,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
