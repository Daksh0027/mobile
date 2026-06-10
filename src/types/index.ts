// Shared track type used across the app
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId: string | null;
  duration: string;
  durationSec: number;
  audioUrl: string;
  coverUrl: string;
  plays: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  rawArtists?: {
    primary?: Array<{ id: string; name: string }>;
    featured?: Array<{ id: string; name: string }>;
  };
}

export interface Playlist {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
}

// Map a JioSaavn API song object to our Track type
export function mapApiSong(song: any): Track | null {
  if (!song) return null;
  const images = song.image || [];
  const coverUrl =
    images.find((i: any) => i.quality === '500x500')?.url ||
    images.find((i: any) => i.quality === '150x150')?.url ||
    images[images.length - 1]?.url ||
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400';

  const downloads = song.downloadUrl || [];
  const audioUrl =
    downloads.find((d: any) => d.quality === '320kbps')?.url ||
    downloads.find((d: any) => d.quality === '160kbps')?.url ||
    downloads[downloads.length - 1]?.url || '';

  const artistName =
    song.artists?.primary?.map((a: any) => a.name).join(', ') || 'Unknown Artist';
  const durationSec = song.duration || 0;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;

  return {
    id: song.id,
    title: song.name,
    artist: artistName,
    album: song.album?.name || 'Single',
    albumId: song.album?.id || null,
    duration: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
    durationSec,
    audioUrl,
    coverUrl,
    plays: song.playCount ? song.playCount.toLocaleString() : '100,000+',
    hasLyrics: song.hasLyrics || false,
    lyricsId: song.lyricsId || null,
    rawArtists: song.artists,
  };
}
