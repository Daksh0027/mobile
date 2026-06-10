import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { BACKEND_BASE } from '@/constants/config';
import type { Track } from '@/types';

// Lazy-import expo-audio so the context can be loaded without crashing
// if the native module is not available (e.g. web preview)
let createAudioPlayer: any = null;
let setAudioModeAsync: any = null;
try {
  const expoAudio = require('expo-audio');
  createAudioPlayer = expoAudio.createAudioPlayer;
  setAudioModeAsync = expoAudio.setAudioModeAsync;
} catch (e) {
  console.warn('[Player] expo-audio not available:', e);
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: boolean;
  queue: Track[];
  playSong: (track: Track, queue?: Track[]) => Promise<void>;
  handlePlayPause: () => void;
  handleNext: () => Promise<void>;
  handlePrev: () => Promise<void>;
  handleScrub: (seconds: number) => void;
  setVolume: (v: number) => void;
  setIsMuted: (m: boolean) => void;
  setShuffle: (s: boolean) => void;
  setRepeat: (r: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

function buildStreamUrl(audioUrl: string): string {
  if (!audioUrl) return '';
  return `${BACKEND_BASE}/stream?url=${encodeURIComponent(audioUrl)}`;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<any>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMutedState] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

  // Configure audio session
  useEffect(() => {
    if (setAudioModeAsync) {
      setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      }).catch(() => {});
    }
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      playerRef.current?.remove?.();
    };
  }, []);

  // Poll player status every 500ms for currentTime/duration/isPlaying
  const startPolling = useCallback(() => {
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    statusIntervalRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setCurrentTime(p.currentTime ?? 0);
        setDuration(p.duration ?? 0);
        const playing = p.playing ?? false;
        setIsPlaying(playing);
        // Auto-advance when finished
        if (!playing && (p.currentTime ?? 0) > 0 && (p.duration ?? 0) > 0 &&
            Math.abs((p.currentTime ?? 0) - (p.duration ?? 0)) < 1.5) {
          handleNextRef.current?.();
        }
      } catch {}
    }, 500);
  }, []);

  const playSong = useCallback(async (track: Track, newQueue?: Track[]) => {
    try {
      // Clean up previous
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      playerRef.current?.remove?.();
      playerRef.current = null;

      if (newQueue) setQueue(newQueue);
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);

      const streamUrl = buildStreamUrl(track.audioUrl);
      if (!streamUrl || !createAudioPlayer) {
        console.warn('[Player] No stream URL or expo-audio unavailable');
        return;
      }

      const player = createAudioPlayer({ uri: streamUrl });
      player.volume = isMuted ? 0 : volume;
      player.loop = repeat;
      playerRef.current = player;

      player.play();
      setIsPlaying(true);
      startPolling();
    } catch (err) {
      console.error('[Player] Failed to play:', err);
    }
  }, [volume, isMuted, repeat, startPolling]);

  const handlePlayPause = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (p.playing) {
        p.pause();
        setIsPlaying(false);
      } else {
        p.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('[Player] PlayPause error:', err);
    }
  }, []);

  // Use a ref so the polling interval closure can call it
  const handleNextRef = useRef<(() => Promise<void>) | null>(null);

  const handleNext = useCallback(async () => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (idx + 1) % queue.length;
    }
    await playSong(queue[nextIdx], queue);
  }, [currentTrack, queue, shuffle, playSong]);

  // Keep ref up to date
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const handlePrev = useCallback(async () => {
    if (!currentTrack || queue.length === 0) return;
    // If more than 3s in, restart
    if (currentTime > 3) {
      playerRef.current?.seekTo?.(0);
      return;
    }
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    await playSong(queue[prevIdx], queue);
  }, [currentTrack, queue, currentTime, playSong]);

  const handleScrub = useCallback((seconds: number) => {
    try {
      playerRef.current?.seekTo?.(seconds);
      setCurrentTime(seconds);
    } catch {}
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (playerRef.current) {
      try { playerRef.current.volume = v; } catch {}
    }
  }, []);

  const setIsMuted = useCallback((m: boolean) => {
    setIsMutedState(m);
    if (playerRef.current) {
      try { playerRef.current.volume = m ? 0 : volume; } catch {}
    }
  }, [volume]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        shuffle,
        repeat,
        queue,
        playSong,
        handlePlayPause,
        handleNext,
        handlePrev,
        handleScrub,
        setVolume,
        setIsMuted,
        setShuffle: useCallback((s: boolean) => setShuffle(s), []),
        setRepeat: useCallback((r: boolean) => {
          setRepeat(r);
          if (playerRef.current) {
            try { playerRef.current.loop = r; } catch {}
          }
        }, []),
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
