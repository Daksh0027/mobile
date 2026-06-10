import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/config';
import type { Track } from '@/types';

const CARD_W = Dimensions.get('window').width * 0.44;

interface ShelfProps {
  title: string;
  tracks: Track[];
  onTrackPress: (track: Track) => void;
  currentTrackId?: string;
}

export default function Shelf({ title, tracks, onTrackPress, currentTrackId }: ShelfProps) {
  if (!tracks.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{title}</Text>
      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const active = item.id === currentTrackId;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onTrackPress(item)}
              activeOpacity={0.75}
            >
              <View style={styles.artWrapper}>
                <Image source={{ uri: item.coverUrl }} style={styles.art} />
                {/* Colored label strip like Spotify */}
                <View style={[styles.label, { backgroundColor: randomColor(item.id) }]}>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
              </View>
              <Text style={[styles.trackTitle, active && { color: Colors.green }]} numberOfLines={2}>
                {item.artist}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// Deterministic color from track id (matches Spotify-style mix thumbnails)
const LABEL_COLORS = ['#e13300', '#1e3264', '#8d67ab', '#e8115b', '#148a08', '#006450'];
function randomColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
}

const styles = StyleSheet.create({
  container: { marginBottom: 28 },
  heading: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  list: { paddingHorizontal: 16, gap: 14 },
  card: { width: CARD_W },
  artWrapper: {
    width: CARD_W,
    height: CARD_W,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#333',
  },
  art: { width: '100%', height: '100%' },
  label: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  labelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  trackTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
