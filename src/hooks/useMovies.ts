import useSWR from 'swr';
import { tmdb } from '../lib/tmdb';

export function useMovies() {
  const { data: popular, error: popularError } = useSWR(
    'popular',
    () => tmdb.getPopularMovies()
  );

  const { data: trending } = useSWR(
    'trending',
    () => tmdb.getPopularMovies(2)
  );

  return {
    popular: popular?.results,
    trending: trending?.results,
    isLoading: !popular && !popularError,
    isError: popularError
  };
}