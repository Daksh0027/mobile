import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@/components/Icon';
import { Colors } from '@/constants/config';
import { useSearch } from '@/hooks/useSearch';
import { usePlayer } from '@/context/PlayerContext';
import type { Track } from '@/types';

// Category browse cards
const CATEGORIES = [
  { label: 'Pop', color: '#e13300' },
  { label: 'Hip-Hop', color: '#8d67ab' },
  { label: 'Bollywood', color: '#e8115b' },
  { label: 'Lo-Fi', color: '#1e3264' },
  { label: 'Rock', color: '#148a08' },
  { label: 'Devotional', color: '#e6a000' },
  { label: 'Jazz', color: '#006450' },
  { label: 'Electronic', color: '#0d73ec' },
];

function TrackItem({ track, onPress, isActive }: { track: Track; onPress: () => void; isActive: boolean }) {
  return (
    <TouchableOpacity style={styles.trackRow} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: track.coverUrl }} style={styles.trackArt} />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, isActive && { color: Colors.green }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Text style={styles.trackDuration}>{track.duration}</Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { query, results, isSearching, search, clear } = useSearch();
  const { playSong, currentTrack, isPlaying } = usePlayer();

  const handlePlay = (track: Track) => {
    playSong(track, results);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Search heading */}
        <Text style={styles.heading}>Search</Text>

        {/* Search input bar */}
        <View style={styles.inputBar}>
          <Ionicons name="search" size={18} color="#b3b3b3" />
          <TextInput
            style={styles.input}
            placeholder="What do you want to play?"
            placeholderTextColor="#b3b3b3"
            value={query}
            onChangeText={search}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clear}>
              <Ionicons name="close-circle" size={18} color="#b3b3b3" />
            </TouchableOpacity>
          )}
        </View>

        {/* No query: category grid */}
        {!query ? (
          <>
            <Text style={styles.subheading}>Browse all</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={i => i.label}
              numColumns={2}
              columnWrapperStyle={styles.catRow}
              contentContainerStyle={styles.catList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.catCard, { backgroundColor: item.color }]}
                  onPress={() => search(item.label)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.catLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        ) : isSearching ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.green} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={i => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TrackItem
                track={item}
                onPress={() => handlePlay(item)}
                isActive={item.id === currentTrack?.id}
              />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  safe: { flex: 1, paddingHorizontal: 16 },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    padding: 0,
  },
  subheading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  catList: { paddingBottom: 100 },
  catRow: { gap: 8, marginBottom: 8 },
  catCard: {
    flex: 1,
    height: 100,
    borderRadius: 8,
    padding: 14,
    justifyContent: 'flex-end',
  },
  catLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  trackArt: { width: 50, height: 50, borderRadius: 4, backgroundColor: '#333' },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  trackArtist: { color: '#b3b3b3', fontSize: 12, marginTop: 2 },
  trackDuration: { color: '#b3b3b3', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: '#b3b3b3', fontSize: 15 },
});
