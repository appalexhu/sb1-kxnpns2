import useSWR from 'swr';
import { tmdb, Movie } from '../lib/tmdb';
import { useLocation } from 'react-router-dom';

export function useMovie(id: string) {
  const location = useLocation();
  const isMovie = location.pathname.startsWith('/movie/');
  const mediaType = isMovie ? 'movie' : 'tv';

  const { data: movie, error } = useSWR(
    ['movie', id, mediaType],
    () => tmdb.getDetails(id, mediaType),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    movie,
    isLoading: !movie && !error,
    isError: error
  };
}