/**
 * useMovieSections Hook
 * 
 * Custom hook for managing movie sections on the home page:
 * - Fetches multiple movie/show lists concurrently
 * - Handles loading and error states
 * - Caches results using SWR
 * - Provides organized sections for:
 *   - Trending Now
 *   - Popular TV Shows
 *   - Popular Movies
 *   - Airing Today
 *   - Top Rated TV Shows
 *   - Top Rated Movies
 */

import useSWR from 'swr';
import { tmdb, Movie, MovieListEndpoint } from '../lib/tmdb';

export interface MovieSection {
  title: string;
  endpoint: MovieListEndpoint;
  movies: Movie[];
}

const ENDPOINTS: { endpoint: MovieListEndpoint; title: string }[] = [
  { endpoint: 'trending', title: 'Trending Now' },
  { endpoint: 'popular_tv', title: 'Popular TV Shows' },
  { endpoint: 'popular_movies', title: 'Popular Movies' },
  { endpoint: 'airing_today', title: 'Airing Today' },
  { endpoint: 'top_rated_tv', title: 'Top Rated TV Shows' },
  { endpoint: 'top_rated', title: 'Top Rated Movies' }
];

const createCacheKey = (endpoint: MovieListEndpoint) => ['movies', endpoint].join('-');

export function useMovieSections() {
  const results = ENDPOINTS.map(({ endpoint, title }) => {
    const cacheKey = createCacheKey(endpoint);
    
    const { data, error } = useSWR(
      cacheKey,
      () => tmdb.fetchMoviesByEndpoint(endpoint),
      {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
      }
    );

    return {
      title,
      endpoint,
      movies: data || [],
      isLoading: !data && !error,
      error
    };
  });

  const isLoading = results.some(result => result.isLoading);
  const error = results.find(result => result.error)?.error;

  const sections = results.map(({ title, endpoint, movies }) => ({
    title,
    endpoint,
    movies
  }));

  return {
    sections,
    isLoading,
    error
  };
}