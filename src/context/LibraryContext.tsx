import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';

interface Playlist {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
}

interface LibraryContextType {
  likedTrackIds: string[];
  playlists: Playlist[];
  toggleLike: (trackId: string) => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  isLoaded: boolean;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch liked songs from Supabase
  const fetchLiked = useCallback(async () => {
    if (!isSignedIn || !userId) return;
    const { data } = await supabase
      .from('liked_songs')
      .select('track_id')
      .eq('user_id', userId);
    if (data) setLikedTrackIds(data.map((r: any) => r.track_id));
  }, [isSignedIn, userId]);

  // Fetch playlists
  const fetchPlaylists = useCallback(async () => {
    if (!isSignedIn || !userId) return;
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setPlaylists(data);
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (isSignedIn) {
      Promise.all([fetchLiked(), fetchPlaylists()]).finally(() => setIsLoaded(true));
    } else {
      setLikedTrackIds([]);
      setPlaylists([]);
      setIsLoaded(true);
    }
  }, [isSignedIn, fetchLiked, fetchPlaylists]);

  const toggleLike = useCallback(async (trackId: string) => {
    if (!isSignedIn || !userId) return;
    const isLiked = likedTrackIds.includes(trackId);
    if (isLiked) {
      setLikedTrackIds(prev => prev.filter(id => id !== trackId));
      await supabase.from('liked_songs').delete().eq('user_id', userId).eq('track_id', trackId);
    } else {
      setLikedTrackIds(prev => [...prev, trackId]);
      await supabase.from('liked_songs').upsert({ user_id: userId, track_id: trackId });
    }
  }, [isSignedIn, userId, likedTrackIds]);

  const createPlaylist = useCallback(async (name: string) => {
    if (!isSignedIn || !userId) return;
    const { data } = await supabase
      .from('playlists')
      .insert({ title: name, user_id: userId })
      .select()
      .single();
    if (data) setPlaylists(prev => [data, ...prev]);
  }, [isSignedIn, userId]);

  const deletePlaylist = useCallback(async (id: string) => {
    if (!isSignedIn || !userId) return;
    setPlaylists(prev => prev.filter(p => p.id !== id));
    await supabase.from('playlists').delete().eq('id', id).eq('user_id', userId);
  }, [isSignedIn, userId]);

  return (
    <LibraryContext.Provider value={{ likedTrackIds, playlists, toggleLike, createPlaylist, deletePlaylist, isLoaded }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
