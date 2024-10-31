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

const createCacheKey = (endpoint: MovieListEndpoint) => ['movies', endpoint, new Date().toDateString()].join('-');

const logCache = (key: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Cache hit for ${key}:`, {
      timestamp: new Date().toISOString(),
      isCached: !!data,
      dataSize: data ? JSON.stringify(data).length : 0
    });
  }
};

export function useMovieSections() {
  const results = ENDPOINTS.map(({ endpoint, title }) => {
    const cacheKey = createCacheKey(endpoint);
    
    const { data, error } = useSWR(
      cacheKey,
      () => tmdb.fetchMoviesByEndpoint(endpoint),
      {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours
        onSuccess: (data) => logCache(cacheKey, data)
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