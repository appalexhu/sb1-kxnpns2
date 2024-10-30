import React from 'react';
import { useMovieSections } from '../hooks/useMovieSections';
import MovieSection from '../components/MovieSection';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { sections, isLoading, error } = useMovieSections();

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500">Failed to load movies</h2>
        <p className="text-gray-400 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        sections.map((section) => (
          <MovieSection
            key={section.endpoint}
            title={section.title}
            movies={section.movies}
          />
        ))
      )}
    </div>
  );
};

export default Home;