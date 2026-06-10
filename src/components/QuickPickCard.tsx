import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Colors } from '@/constants/config';
import type { Track } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface QuickPickCardProps {
  track: Track;
  onPress: () => void;
  isPlaying?: boolean;
}

export default function QuickPickCard({ track, onPress, isPlaying }: QuickPickCardProps) {
  return (
    <TouchableOpacity style={[styles.card, isPlaying && styles.cardActive]} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: track.coverUrl }}
        style={styles.img}
      />
      <Text style={styles.title} numberOfLines={2}>
        {track.title}
      </Text>
      {isPlaying && <View style={styles.playingDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardActive: {
    backgroundColor: '#2a2a2a',
  },
  img: {
    width: 52,
    height: 52,
    backgroundColor: '#333',
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
    marginRight: 10,
  },
});
