import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@/components/Icon';
import Slider from '@react-native-community/slider';
import { usePlayer } from '@/context/PlayerContext';
import { useLibrary } from '@/context/LibraryContext';
import { Colors } from '@/constants/config';

const { width, height } = Dimensions.get('window');

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

interface FullPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export default function FullPlayer({ visible, onClose }: FullPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    handlePlayPause,
    handleNext,
    handlePrev,
    handleScrub,
    setVolume,
    setIsMuted,
    setShuffle,
    setRepeat,
  } = usePlayer();
  const { likedTrackIds, toggleLike } = useLibrary();

  if (!currentTrack) return null;
  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        {/* Blurred background */}
        <Image
          source={{ uri: currentTrack.coverUrl }}
          style={styles.bgImage}
          blurRadius={Platform.OS === 'android' ? 20 : 0}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)', '#000']}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Now Playing</Text>
          <TouchableOpacity hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Album art */}
        <View style={styles.artContainer}>
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.art} />
        </View>

        {/* Track info + like */}
        <View style={styles.trackRow}>
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleLike(currentTrack.id)} style={styles.likeBtn}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={26}
              color={isLiked ? Colors.green : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Scrubber */}
        <View style={styles.scrubSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1}
            value={currentTime}
            onSlidingComplete={handleScrub}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#fff"
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Main controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => setShuffle(!shuffle)}>
            <Ionicons name="shuffle" size={22} color={shuffle ? Colors.green : 'rgba(255,255,255,0.6)'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePrev} style={styles.skipBtn}>
            <Ionicons name="play-skip-back" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.skipBtn}>
            <Ionicons name="play-skip-forward" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setRepeat(!repeat)}>
            <Ionicons name="repeat" size={22} color={repeat ? Colors.green : 'rgba(255,255,255,0.6)'} />
          </TouchableOpacity>
        </View>

        {/* Volume */}
        <View style={styles.volumeRow}>
          <TouchableOpacity onPress={() => setIsMuted(!isMuted)}>
            <Ionicons name={isMuted || volume === 0 ? 'volume-mute' : 'volume-medium'} size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={isMuted ? 0 : volume}
            onValueChange={setVolume}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#fff"
          />
          <Ionicons name="volume-high" size={18} color="rgba(255,255,255,0.5)" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 52,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  artContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  art: {
    width: width - 48,
    height: width - 48,
    borderRadius: 12,
    backgroundColor: '#333',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  trackInfo: { flex: 1, marginRight: 16 },
  trackTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    marginTop: 4,
  },
  likeBtn: { padding: 4 },
  scrubSection: { marginBottom: 8 },
  slider: { width: '100%', height: 40 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  skipBtn: { padding: 4 },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeSlider: { flex: 1, height: 40 },
});
