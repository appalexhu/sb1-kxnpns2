import useSWR from 'swr';
import { tmdb } from '../lib/tmdb';

export function useSearch(query: string) {
  const { data, error } = useSWR(
    query ? ['search', query] : null,
    () => tmdb.searchMulti(query)
  );

  return {
    results: data,
    isLoading: query && !data && !error,
    isError: error
  };
}