import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { tmdb } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const searchMovies = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await tmdb.searchMulti(query);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setIsLoading(false);
      }
    };

    searchMovies();
  }, [query]);

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500">Search failed</h2>
        <p className="text-gray-400 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <SearchIcon className="w-8 h-8 text-yellow-400" />
        <h1 className="text-3xl font-bold">
          {query ? `Search results for "${query}"` : 'Search Movies'}
        </h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">No results found</h2>
          <p className="text-gray-400 mt-2">Try searching for something else</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((movie) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;