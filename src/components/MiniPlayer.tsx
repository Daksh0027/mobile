import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@/components/Icon';
import { usePlayer } from '@/context/PlayerContext';
import { useLibrary } from '@/context/LibraryContext';
import { Colors } from '@/constants/config';


interface MiniPlayerProps {
  onPress: () => void;
}

export default function MiniPlayer({ onPress }: MiniPlayerProps) {
  const { currentTrack, isPlaying, handlePlayPause, handleNext, currentTime, duration } = usePlayer();
  const { likedTrackIds, toggleLike } = useLibrary();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Progress bar at top */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.inner}>
        {/* Album art */}
        <Image source={{ uri: currentTrack.coverUrl }} style={styles.art} />

        {/* Track info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={e => { toggleLike(currentTrack.id); }}
            style={styles.btn}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? Colors.green : Colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.btn}>
            <Ionicons name="play-skip-forward" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 4,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  progressBg: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textPrimary,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    padding: 6,
  },
  playBtn: {
    padding: 6,
  },
});
