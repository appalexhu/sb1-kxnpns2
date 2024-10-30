import React from 'react';
import { Movie } from '../lib/tmdb';

interface SeasonEpisodePickerProps {
  movie: Movie;
  onSelect: (season: number, episode: number) => void;
  onClose: () => void;
}

const SeasonEpisodePicker: React.FC<SeasonEpisodePickerProps> = ({ movie, onSelect, onClose }) => {
  const [selectedSeason, setSelectedSeason] = React.useState(1);
  const [selectedEpisode, setSelectedEpisode] = React.useState(1);

  const validSeasons = React.useMemo(() => {
    if (!movie.number_of_seasons) return [];
    return Array.from({ length: movie.number_of_seasons }, (_, i) => i + 1);
  }, [movie.number_of_seasons]);

  const validEpisodes = React.useMemo(() => {
    if (!movie.number_of_episodes) return [];
    return Array.from({ length: movie.number_of_episodes }, (_, i) => i + 1);
  }, [movie.number_of_episodes]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Select Episode</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {validSeasons.map((season) => (
                <option key={season} value={season}>
                  Season {season}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Episode</label>
            <select
              value={selectedEpisode}
              onChange={(e) => setSelectedEpisode(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {validEpisodes.map((episode) => (
                <option key={episode} value={episode}>
                  Episode {episode}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selectedSeason, selectedEpisode)}
            className="flex-1 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonEpisodePicker;