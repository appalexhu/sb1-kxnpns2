import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { tmdb, Movie } from '../lib/tmdb';

interface MovieCardProps extends Movie {
  layout?: 'poster' | 'backdrop';
  showRank?: number;
  showOverview?: boolean;
  hideInfo?: boolean;
}

const MovieCard = ({ layout = 'poster', showRank, showOverview, hideInfo = false, ...props }: MovieCardProps) => {
  const isMovie = props.media_type === 'movie' || (!props.media_type && props.title);
  const displayName = props.title ?? props.name ?? 'N/A';
  const year = props.release_date || props.first_air_date
    ? new Date(props.release_date || props.first_air_date || '').getFullYear()
    : '';
  const rating = props.vote_average 
    ? (Math.round(props.vote_average * 10) / 10).toFixed(1) 
    : 'N/A';

  const contentType = isMovie ? 'movie' : 'series';

  return (
    <Link 
      to={`/${contentType}/${props.id}`} 
      className="block group"
    >
      <div className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${hideInfo ? 'h-full' : ''}`}>
        <div className={`relative ${layout === 'poster' ? 'aspect-[2/3]' : 'aspect-video'}`}>
          {showRank && (
            <div className="absolute top-0 left-0 bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-br-lg z-10">
              #{showRank}
            </div>
          )}
          <img
            src={tmdb.getImageUrl(
              layout === 'poster' ? props.poster_path : props.backdrop_path,
              layout === 'poster' ? 'w500' : 'w780'
            )}
            alt={displayName}
            className="w-full h-full object-cover"
          />
          {!hideInfo && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          {hideInfo && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white truncate">{displayName}</h3>
              </div>
            </div>
          )}
        </div>
        {!hideInfo && (
          <div className="p-3">
            <h3 className="text-lg font-semibold text-white truncate">{displayName}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-400">{year}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-yellow-400">{rating}</span>
              </div>
            </div>
            {showOverview && (
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                {props.overview}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MovieCard;