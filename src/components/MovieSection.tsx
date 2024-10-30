/**
 * MovieSection Component
 * 
 * Displays a horizontal scrollable section of movies/shows:
 * - Responsive grid layout
 * - Smooth horizontal scrolling
 * - Dynamic scroll buttons
 * - Hover effects and animations
 * - Supports different card layouts (poster/backdrop)
 * - Shows rankings for top-rated content
 * - Handles overflow with elegant fade effects
 */

import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '../lib/tmdb';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
}

const MovieSection: React.FC<MovieSectionProps> = ({ title, movies }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const isTrending = title === 'Trending Now';
  const cardWidth = isTrending ? 240 : 360;

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = direction === 'left' ? -800 : 800;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold px-4">{title}</h2>
      
      <div className="relative group">
        {showLeftButton && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-2 rounded-r-lg 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {showRightButton && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-2 rounded-l-lg 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4"
          style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
        >
          {movies.map((movie, index) => (
            <div 
              key={movie.id} 
              className="flex-none"
              style={{ width: `${cardWidth}px` }}
            >
              <MovieCard 
                {...movie} 
                layout={isTrending ? 'poster' : 'backdrop'}
                showRank={title.includes('Top Rated') ? index + 1 : undefined}
                showOverview={title.includes('Airing Today')}
                hideInfo={isTrending}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieSection;