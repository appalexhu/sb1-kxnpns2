import { useState, useEffect, useCallback } from 'react';
import { fetchWords, fetchWordDefinition, fetchMovieExternalIds, fetchEpisodeExternalIds } from '../lib/api';
import { SubtitleAnalysis, WordDefinition, Words, WordLevel } from '../lib/words';

function mapApiResponseToWordLevels(response: SubtitleAnalysis): Words {
  if (!response.words) {
    return {
      [WordLevel.Proficiency]: [],
      [WordLevel.Advanced]: [],
      [WordLevel.UpperIntermediate]: [],
      [WordLevel.Intermediate]: [],
      [WordLevel.Elementary]: [],
      [WordLevel.Beginner]: []
    };
  }

  return {
    [WordLevel.Proficiency]: response.words.C2 || [],
    [WordLevel.Advanced]: response.words.C1 || [],
    [WordLevel.UpperIntermediate]: response.words.B2 || [],
    [WordLevel.Intermediate]: response.words.B1 || [],
    [WordLevel.Elementary]: response.words.A2 || [],
    [WordLevel.Beginner]: response.words.A1 || []
  };
}

export function useWords(movieId: string, season?: string | null, episode?: string | null) {
  const [data, setData] = useState<SubtitleAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadWords = useCallback(async () => {
    if (!movieId) return;

    try {
      setIsLoading(true);
      setError(null);

      const numericId = parseInt(movieId);
      
      let imdbId: string;
      let useSeasonEpisode = false;
      
      if (season && episode) {
        try {
          const episodeIds = await fetchEpisodeExternalIds(
            numericId,
            parseInt(season),
            parseInt(episode)
          );
          imdbId = episodeIds.imdb_id;
          useSeasonEpisode = false;
        } catch (error) {
          const seriesIds = await fetchMovieExternalIds(numericId, 'tv');
          if (!seriesIds?.imdb_id) {
            throw new Error('No IMDB ID found for this content');
          }
          imdbId = seriesIds.imdb_id;
          useSeasonEpisode = true;
        }
      } else {
        const type = season ? 'tv' : 'movie';
        const ids = await fetchMovieExternalIds(numericId, type);
        if (!ids?.imdb_id) {
          throw new Error('No IMDB ID found for this content');
        }
        imdbId = ids.imdb_id;
      }

      const result = await fetchWords(imdbId, 
        useSeasonEpisode && season ? parseInt(season) : undefined, 
        useSeasonEpisode && episode ? parseInt(episode) : undefined
      );
      
      if (!result?.words && !result?.meta) {
        throw new Error('Invalid response format from words API');
      }
      setData(result);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load words';
      console.error('Words loading error:', errorMessage);
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [movieId, season, episode]);

  useEffect(() => {
    loadWords();
  }, [loadWords, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  return {
    words: data ? mapApiResponseToWordLevels(data) : null,
    meta: data?.meta || null,
    isLoading,
    error,
    retry
  };
}

export function useWordDefinition() {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadDefinition = useCallback(async (word: string) => {
    if (!word.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchWordDefinition(word);
      setDefinition(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch definition';
      console.error('Definition loading error:', errorMessage);
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    definition,
    isLoading,
    error,
    loadDefinition
  };
}