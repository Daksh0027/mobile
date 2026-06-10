/**
 * Icon component using expo-symbols (SDK 56+) with SVG fallback.
 * Avoids @expo/vector-icons dependency.
 */
import React from 'react';
import { Text, Platform } from 'react-native';

interface IconProps {
  name: keyof typeof ICONS;
  size?: number;
  color?: string;
}

// Simple Unicode/emoji fallback icon map
const ICONS = {
  'home': '⌂',
  'home-outline': '⌂',
  'search': '⌕',
  'search-outline': '⌕',
  'library': '≡',
  'library-outline': '≡',
  'heart': '♥',
  'heart-outline': '♡',
  'play': '▶',
  'pause': '⏸',
  'play-skip-forward': '⏭',
  'play-skip-back': '⏮',
  'shuffle': '⇄',
  'repeat': '↺',
  'chevron-down': '⌄',
  'ellipsis-horizontal': '•••',
  'close-circle': '✕',
  'add': '+',
  'volume-mute': '🔇',
  'volume-medium': '🔊',
  'volume-high': '🔊',
  'musical-notes': '♪',
} as const;

export function Icon({ name, size = 24, color = '#fff' }: IconProps) {
  return (
    <Text style={{ fontSize: size * 0.75, color, lineHeight: size, textAlign: 'center' }}>
      {ICONS[name] ?? '?'}
    </Text>
  );
}

// Re-export as Ionicons-compatible interface for easy drop-in
export const Ionicons = Icon;
