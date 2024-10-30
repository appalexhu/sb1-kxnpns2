/**
 * TMDB API Client
 * 
 * Handles all interactions with The Movie Database API:
 * - Movie/Show data fetching
 * - Image URL generation
 * - Search functionality
 * - Type definitions for API responses
 * - Filtering and data transformation
 * - Caching configuration
 * 
 * Supported endpoints:
 * - Movie/Show details
 * - Trending content
 * - Popular content
 * - Top rated content
 * - Search (multi-type)
 */

const TMDB_API_KEY = '31fbd8554bb7a541309ed503a1c2d56d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type MovieListEndpoint = 
  | 'trending'
  | 'popular_tv'
  | 'popular_movies'
  | 'airing_today'
  | 'top_rated_tv'
  | 'top_rated';

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres?: Genre[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
}

interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

class TMDBClient {
  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    return response.json();
  }

  getImageUrl(path: string | null, size: string = 'original'): string {
    if (!path) return 'https://via.placeholder.com/500x750';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  async getDetails(id: string, mediaType: string = 'movie'): Promise<Movie> {
    return this.fetch<Movie>(`/${mediaType}/${id}`, { append_to_response: 'credits,videos' });
  }

  async fetchMoviesByEndpoint(endpoint: MovieListEndpoint): Promise<Movie[]> {
    const dateFormatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const today = dateFormatter.format(new Date());
    
    let url = '';
    let params: Record<string, string> = {
      language: 'en-US'
    };

    switch (endpoint) {
      case 'trending':
        url = '/trending/all/week';
        break;

      case 'popular_movies':
        url = '/movie/popular';
        break;

      case 'popular_tv':
        url = '/discover/tv';
        params = {
          ...params,
          api_key: TMDB_API_KEY,
          page: '1',
          with_original_language: 'en',
          sort_by: 'vote_count.desc',
          'first_air_date.gte': dateFormatter.format(new Date(Date.now() - 36 * 20 * 24 * 60 * 60 * 1000)),
          'first_air_date.lte': today,
          without_genres: '10767,10766,10764,10763',
          with_origin_country: 'US',
          language: 'en-US'
        };
        break;

      case 'airing_today':
        url = '/discover/tv';
        params = {
          ...params,
          api_key: TMDB_API_KEY,
          page: '1',
          with_original_language: 'en',
          sort_by: 'vote_count.desc',
          'first_air_date.gte': dateFormatter.format(new Date(Date.now() - 360 * 20 * 24 * 60 * 60 * 1000)),
          'first_air_date.lte': today,
          without_genres: '10767,10766,10764,10763',
          with_origin_country: 'US',
          'air_date.gte': dateFormatter.format(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
          'air_date.lte': today,
          language: 'en-US'
        };
        break;

      case 'top_rated':
        url = '/movie/top_rated';
        break;

      case 'top_rated_tv':
        url = '/tv/top_rated';
        break;
    }

    const response = await this.fetch<MovieResponse>(url, params);
    return response.results.filter(movie => 
      ![1022789, 150540, 225634].includes(movie.id)
    );
  }

  async searchMulti(query: string): Promise<Movie[]> {
    const response = await this.fetch<MovieResponse>('/search/multi', {
      query,
      include_adult: 'false',
      language: 'en-US'
    });

    return response.results.filter(movie => 
      movie.media_type !== 'person' && 
      movie.backdrop_path != null && 
      ![1022789, 150540, 225634].includes(movie.id)
    );
  }
}

export const tmdb = new TMDBClient();