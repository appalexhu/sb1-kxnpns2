import React from 'react';
import { Helmet } from 'react-helmet-async';
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
    <>
      <Helmet>
        <title>Learn English with Netflix, TV Shows, Movies | Wordy</title>
        <meta name="description" content="Improve your English effortlessly by watching your favorite movies with Wordy's real-time subtitle translations and vocabulary insights." />
      </Helmet>
      
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
    </>
  );
};

export default Home;