import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Clock, Calendar, Users, Globe, TrendingUp, Clapperboard, Languages, Film } from 'lucide-react';
import { useMovie } from '../hooks/useMovie';
import { tmdb } from '../lib/tmdb';
import LoadingSpinner from '../components/LoadingSpinner';
import SeasonEpisodePicker from '../components/SeasonEpisodePicker';

const MovieDetail = () => {
  const { id = '' } = useParams();
  const location = useLocation();
  const isMovie = location.pathname.startsWith('/movie/');
  const navigate = useNavigate();
  const { movie, isLoading, isError } = useMovie(id);
  const [showPicker, setShowPicker] = useState(false);

  if (isError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500">Failed to load {isMovie ? 'movie' : 'series'}</h2>
        <p className="text-gray-400 mt-2">Please try again later</p>
      </div>
    );
  }

  if (isLoading || !movie) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const title = movie.title || movie.name || '';
  const releaseYear = new Date(movie.release_date || movie.first_air_date || '').getFullYear();
  const director = movie.credits?.crew.find(person => person.job === 'Director');
  const writers = movie.credits?.crew.filter(person => 
    ['Writer', 'Screenplay', 'Story'].includes(person.job)
  ).slice(0, 3);
  const producers = movie.credits?.crew.filter(person => 
    person.job === 'Producer' || person.job === 'Executive Producer'
  ).slice(0, 3);
  const cast = movie.credits?.cast.slice(0, 12) || [];
  const runtime = isMovie ? movie.runtime : movie.episode_run_time?.[0];
  const trailer = movie.videos?.results.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  const handleWordsClick = () => {
    if (!isMovie) {
      setShowPicker(true);
    } else {
      navigate(`/words/${movie.id}`);
    }
  };

  const handleEpisodeSelect = (season: number, episode: number) => {
    setShowPicker(false);
    navigate(`/words/${movie.id}?season=${season}&episode=${episode}`);
  };

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': isMovie ? 'Movie' : 'TVSeries',
    name: title,
    description: movie.overview,
    datePublished: movie.release_date || movie.first_air_date,
    image: tmdb.getImageUrl(movie.poster_path, 'original'),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: movie.vote_average,
      ratingCount: movie.vote_count,
      bestRating: 10,
      worstRating: 0
    },
    director: director ? {
      '@type': 'Person',
      name: director.name
    } : undefined,
    actor: cast.map(actor => ({
      '@type': 'Person',
      name: actor.name
    }))
  };

  const ogImageUrl = tmdb.getImageUrl(movie.backdrop_path, 'original');

  return (
    <>
      <Helmet>
        <title>Learn English with {title} | Wordy</title>
        <meta name="description" content={`Enhance your English vocabulary by watching ${title}. Explore key terms, learn in context, and master English while enjoying this ${isMovie ? 'film' : 'series'} on Wordy.`} />
        
        <meta property="og:title" content={`Learn English with ${title} - Wordy Language Learning`} />
        <meta property="og:description" content={`Improve your English through ${title}. Discover vocabulary, phrases, and cultural context while watching.`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta property="og:type" content={isMovie ? 'video.movie' : 'video.tv_show'} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Learn English with ${title} - Wordy Language Learning`} />
        <meta name="twitter:description" content={`Improve your English through ${title}. Discover vocabulary, phrases, and cultural context while watching.`} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        <meta name="keywords" content={`learn english with ${title}, ${title} vocabulary, english vocabulary ${title}, learn english ${isMovie ? 'movies' : 'tv shows'}, ${title} english subtitles`} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="-mt-8">
        {/* Hero Section */}
        <div className="relative min-h-[70vh] md:h-[70vh]">
          <img
            src={tmdb.getImageUrl(movie.backdrop_path, 'original')}
            alt={`Learn English with ${title}`}
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/50 to-gray-900/90" />
          
          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-4 md:p-8">
              <div className="container mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="w-48 md:w-64 mx-auto md:mx-0 flex-shrink-0">
                  <img
                    src={tmdb.getImageUrl(movie.poster_path, 'w500')}
                    alt={title}
                    className="w-full rounded-lg shadow-xl"
                  />
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
                  
                  <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span>{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                    {runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-5 h-5" />
                        <span>{runtime} min</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-5 h-5" />
                      <span>{releaseYear}</span>
                    </div>
                    {!isMovie && movie.number_of_seasons && (
                      <div className="flex items-center gap-1">
                        <Film className="w-5 h-5" />
                        <span>{movie.number_of_seasons} Season{movie.number_of_seasons !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {movie.genres?.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-300 max-w-2xl mx-auto md:mx-0">
                    {movie.overview}
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button 
                      onClick={handleWordsClick}
                      className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      <Languages className="w-5 h-5" />
                      View Vocabulary
                    </button>
                    {trailer && (
                      <a
                        href={`https://www.youtube.com/watch?v=${trailer.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        <Clapperboard className="w-5 h-5" />
                        Watch Trailer
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Credits & Info */}
            <div className="space-y-8">
              {/* Key Details */}
              <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                {director && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Director</h3>
                    <p className="text-gray-300">{director.name}</p>
                  </div>
                )}
                
                {writers && writers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Writers</h3>
                    <div className="space-y-1">
                      {writers.map(writer => (
                        <p key={writer.id} className="text-gray-300">{writer.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                {producers && producers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Producers</h3>
                    <div className="space-y-1">
                      {producers.map(producer => (
                        <p key={producer.id} className="text-gray-300">{producer.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                {!isMovie && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Series Info</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-gray-400" />
                        <p className="text-gray-300">
                          {movie.number_of_seasons} Season{movie.number_of_seasons !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clapperboard className="w-5 h-5 text-gray-400" />
                        <p className="text-gray-300">
                          {movie.number_of_episodes} Episode{movie.number_of_episodes !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {runtime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <p className="text-gray-300">{runtime} minutes per episode</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Stats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-300">
                        {movie.vote_average.toFixed(1)}/10 ({movie.vote_count.toLocaleString()} votes)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-300">
                        Popularity: {Math.round(movie.popularity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-300">
                        Original Language: {movie.original_language?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cast Grid */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">Cast</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {cast.map((actor) => (
                  <div key={actor.id} className="bg-gray-800 rounded-lg overflow-hidden group">
                    <div className="aspect-[2/3] relative">
                      <img
                        src={tmdb.getImageUrl(actor.profile_path, 'w500')}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold truncate">{actor.name}</h4>
                      <p className="text-sm text-gray-400 truncate">{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Season/Episode Picker Modal */}
        {showPicker && (
          <SeasonEpisodePicker
            movie={movie}
            onSelect={handleEpisodeSelect}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </>
  );
};

export default MovieDetail;