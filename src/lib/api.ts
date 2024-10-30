import { SubtitleAnalysis, WordDefinition } from './words';

const API_URL = 'https://languages-3gjfrlsiq-sandor-bogyos-projects.vercel.app/api';
const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const CORS_PROXY = 'https://corsproxy.io/?';

class CustomError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CustomError';
  }

  static episodeNotAired(lastAired: string) {
    return new CustomError(`Episode not aired yet. Last aired: ${lastAired}`, 'EPISODE_NOT_AIRED');
  }

  static recentlyReleasedMovie(releaseDate: string) {
    return new CustomError(`Movie was released recently on ${releaseDate}`, 'RECENTLY_RELEASED');
  }

  static subtitleNotFound() {
    return new CustomError('No subtitles found for this content', 'SUBTITLE_NOT_FOUND');
  }

  static translationFailed(details?: string) {
    return new CustomError(`Translation failed${details ? `: ${details}` : ''}`, 'TRANSLATION_FAILED');
  }
}

async function handleApiResponse<T>(response: Response, errorPrefix: string): Promise<T> {
  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        errorMessage = await response.text() || errorMessage;
      } catch {
        // If we can't get any error details, use the status text
      }
    }
    throw new Error(`${errorPrefix}: ${errorMessage}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`${errorPrefix}: Invalid JSON response`);
    }
  }
  
  throw new Error(`${errorPrefix}: Unexpected response format`);
}

export async function fetchMovieExternalIds(movieId: number, type: 'movie' | 'tv'): Promise<{ imdb_id: string }> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${type}/${movieId}/external_ids?api_key=31fbd8554bb7a541309ed503a1c2d56d`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    const data = await handleApiResponse<{ imdb_id: string }>(response, 'Failed to fetch external IDs');
    if (!data.imdb_id) {
      throw new Error('No IMDB ID found in the response');
    }
    return data;
  } catch (error) {
    console.error('External IDs fetch error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch external IDs');
  }
}

export async function fetchEpisodeExternalIds(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<{ imdb_id: string }> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/external_ids?api_key=31fbd8554bb7a541309ed503a1c2d56d`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    const data = await handleApiResponse<{ imdb_id: string }>(response, 'Failed to fetch episode external IDs');
    if (!data.imdb_id) {
      throw CustomError.subtitleNotFound();
    }
    return data;
  } catch (error) {
    console.error('Episode external IDs fetch error:', error);
    throw error instanceof CustomError ? error : new Error('Failed to fetch episode external IDs');
  }
}

export async function fetchWords(imdbId: string, season?: number, episode?: number): Promise<SubtitleAnalysis> {
  try {
    const numericImdbId = parseInt(imdbId.replace(/^tt/, ''));
    if (isNaN(numericImdbId)) {
      throw new Error(`Invalid IMDB ID format: ${imdbId}`);
    }
    
    const params = new URLSearchParams({
      imdbid: numericImdbId.toString()
    });
    
    if (season !== undefined && episode !== undefined) {
      params.append('season', season.toString());
      params.append('episode', episode.toString());
    }

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${API_URL}/processSubtitle?${params}`)}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await handleApiResponse<SubtitleAnalysis>(response, 'Subtitle processing failed');
    if (!data || (!data.words && !data.meta)) {
      throw CustomError.subtitleNotFound();
    }

    return data;
  } catch (error) {
    console.error('Words fetch error:', error);
    throw error instanceof CustomError ? error : new Error('Failed to fetch words');
  }
}

export async function fetchWordDefinition(word: string): Promise<WordDefinition> {
  try {
    const response = await fetch(`${DICTIONARY_API_URL}/${encodeURIComponent(word)}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await handleApiResponse<WordDefinition[]>(response, 'Failed to fetch word definition');
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No definition found for word: ${word}`);
    }
    
    return data[0];
  } catch (error) {
    console.error('Word definition fetch error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch word definition');
  }
}

interface TranslationResponse {
  word: string;
  sentence?: string;
  error?: string;
}

export async function translateText(text: string, sentence: string | null, targetLang: string): Promise<[string, string?]> {
  if (!text || !targetLang) {
    throw CustomError.translationFailed('Missing required parameters');
  }

  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${API_URL}/translateText`)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        word: text.trim(),
        sentence: sentence?.trim(),
        targetLang: targetLang.trim(),
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw CustomError.translationFailed(errorText);
    }

    let data: TranslationResponse;
    try {
      data = await response.json();
    } catch {
      throw CustomError.translationFailed('Invalid JSON response');
    }

    if (data.error) {
      throw CustomError.translationFailed(data.error);
    }

    if (!data.word) {
      throw CustomError.translationFailed('No translation provided');
    }

    return [data.word, data.sentence];
  } catch (error) {
    console.error('Text translation error:', error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw CustomError.translationFailed(error instanceof Error ? error.message : 'Unknown error');
  }
}