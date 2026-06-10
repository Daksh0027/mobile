import { useState, useCallback, useRef } from 'react';
import { API_BASE } from '@/constants/config';
import { mapApiSong } from '@/types';
import type { Track } from '@/types';

export function useSearch() {
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `${API_BASE}/search/songs?query=${encodeURIComponent(q)}&page=1&limit=25`
        );
        const json = await res.json();
        const tracks = (json.data?.results || [])
          .map(mapApiSong)
          .filter(Boolean) as Track[];
        setResults(tracks);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, []);

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
    setResults([]);
    setIsSearching(false);
  }, []);

  return { query, results, isSearching, search, clear };
}
