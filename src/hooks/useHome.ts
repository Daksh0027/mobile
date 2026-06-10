import { useEffect, useState } from 'react';
import { API_BASE } from '@/constants/config';
import { mapApiSong } from '@/types';
import type { Track } from '@/types';

// Featured playlist IDs from JioSaavn (top charts etc.)
const TRENDING_PLAYLIST_IDS = [
  '1134543671', // Global top 50
  '1134543672', // India top 50
];

interface HomeData {
  topTracks: Track[];
  topMixes: Track[];
  recommendedStations: Track[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

async function fetchCharts(): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/charts`);
    if (!res.ok) throw new Error('charts failed');
    const json = await res.json();
    const songs: Track[] = [];
    const lists = json.data || [];
    for (const pl of lists.slice(0, 2)) {
      if (pl.songs) {
        pl.songs.slice(0, 10).forEach((s: any) => {
          const t = mapApiSong(s);
          if (t) songs.push(t);
        });
      }
    }
    return songs;
  } catch {
    return [];
  }
}

async function fetchTrending(): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/songs/trending?lang=hindi,english&limit=20`);
    if (!res.ok) throw new Error('trending failed');
    const json = await res.json();
    return (json.data || []).map(mapApiSong).filter(Boolean) as Track[];
  } catch {
    // Fallback to search
    try {
      const res = await fetch(`${API_BASE}/search/songs?query=hits+2024&page=1&limit=20`);
      const json = await res.json();
      return ((json.data?.results || []).map(mapApiSong).filter(Boolean)) as Track[];
    } catch {
      return [];
    }
  }
}

export function useHome(): HomeData {
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topMixes, setTopMixes] = useState<Track[]>([]);
  const [recommendedStations, setRecommendedStations] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchTrending(),
      fetchCharts(),
    ])
      .then(([trending, charts]) => {
        if (cancelled) return;
        // topTracks = first 8 trending (for quick-picks grid)
        setTopTracks(trending.slice(0, 8));
        // topMixes = next 10 trending
        setTopMixes(trending.slice(8, 18));
        // Recommended = chart tracks
        setRecommendedStations(charts.length ? charts : trending.slice(18, 26));
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  return {
    topTracks,
    topMixes,
    recommendedStations,
    isLoading,
    error,
    refresh: () => setTick(t => t + 1),
  };
}
