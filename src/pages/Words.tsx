import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, BookOpen, Volume2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useWords, useWordDefinition } from '../hooks/useWords';
import { WordLevel, Word } from '../lib/words';
import { fetchWordDefinition, translateText } from '../lib/api';

const WORD_LEVELS = [
  WordLevel.Beginner,
  WordLevel.Elementary,
  WordLevel.Intermediate,
  WordLevel.UpperIntermediate,
  WordLevel.Advanced,
  WordLevel.Proficiency
];

const LEVEL_NAMES: Record<WordLevel, string> = {
  [WordLevel.Proficiency]: 'Proficiency',
  [WordLevel.Advanced]: 'Advanced',
  [WordLevel.UpperIntermediate]: 'Upper-Intermediate',
  [WordLevel.Intermediate]: 'Intermediate',
  [WordLevel.Elementary]: 'Elementary',
  [WordLevel.Beginner]: 'Beginner'
};

const LANGUAGES = [
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'IT', name: 'Italian' },
  { code: 'PT', name: 'Portuguese' },
  { code: 'RU', name: 'Russian' },
  { code: 'ZH', name: 'Chinese' },
  { code: 'JA', name: 'Japanese' },
  { code: 'KO', name: 'Korean' }
];

const Words = () => {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');
  
  const { words, meta, isLoading, error, retry } = useWords(id, season, episode);
  const { definition, loadDefinition } = useWordDefinition();
  
  const [searchText, setSearchText] = useState('');
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [showDefinition, setShowDefinition] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [translation, setTranslation] = useState<{ word: string; sentence?: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Calculate total words for non-zero levels
  const totalNonZeroWords = useMemo(() => {
    if (!words) return 0;
    return WORD_LEVELS.reduce((total, level) => {
      return total + (words[level]?.length || 0);
    }, 0);
  }, [words]);

  const handleTranslate = async () => {
    if (!selectedWord) return;
    
    setIsTranslating(true);
    try {
      const [translatedWord, translatedSentence] = await translateText(
        selectedWord.word,
        selectedWord.sentence,
        selectedLanguage.code
      );
      setTranslation({ word: translatedWord, sentence: translatedSentence });
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          {error.message || 'Failed to load words'}
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">
          There was an error loading the vocabulary. This might be temporary - please try again.
        </p>
        <button
          onClick={retry}
          className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">Loading vocabulary...</p>
      </div>
    );
  }

  if (!words || !meta) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-400">No words found</h2>
        <p className="text-gray-500 mt-2">
          We couldn't find any vocabulary for this content.
        </p>
      </div>
    );
  }

  const filteredWords = (level: WordLevel) => {
    if (!words[level]) return [];
    return words[level].filter(word => 
      word.word.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const calculatePercentage = (level: WordLevel) => {
    const levelWords = words[level]?.length || 0;
    return totalNonZeroWords > 0 ? (levelWords / totalNonZeroWords) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-yellow-400" />
          <h1 className="text-2xl font-bold">Vocabulary</h1>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search words..."
            className="w-64 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 pl-10"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total Words</p>
          <p className="text-2xl font-bold">{meta.words}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Grade Level</p>
          <p className="text-2xl font-bold">{LEVEL_NAMES[meta.grade as WordLevel]}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg md:col-span-1 col-span-2">
          <p className="text-gray-400 text-sm mb-2">Level Distribution</p>
          <div className="flex h-4">
            {WORD_LEVELS.map(level => {
              const percentage = calculatePercentage(level);
              if (percentage === 0) return null;
              return (
                <div
                  key={level}
                  className="h-full relative group"
                  style={{ width: `${percentage}%` }}
                >
                  <div
                    className={`h-full ${
                      level === WordLevel.Beginner ? 'bg-blue-500 rounded-l' :
                      level === WordLevel.Elementary ? 'bg-green-500' :
                      level === WordLevel.Intermediate ? 'bg-yellow-500' :
                      level === WordLevel.UpperIntermediate ? 'bg-orange-500' :
                      level === WordLevel.Advanced ? 'bg-red-500' :
                      'bg-purple-500 rounded-r'
                    }`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                      {LEVEL_NAMES[level]}: {((words[level]?.length || 0) / meta.words * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Beginner</span>
            <span>Proficiency</span>
          </div>
        </div>
      </div>

      {/* Word Sections */}
      {WORD_LEVELS.slice().reverse().map(level => {
        const levelWords = filteredWords(level);
        if (!levelWords || levelWords.length === 0) return null;

        return (
          <section key={level} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{LEVEL_NAMES[level]} ({levelWords.length})</h2>
              <button 
                onClick={() => {
                  const allSelected = levelWords.every(word => 
                    selectedWords.has(word.id || `${word.word}-${word.startTime}`)
                  );
                  
                  const newSelected = new Set(selectedWords);
                  levelWords.forEach(word => {
                    const wordId = word.id || `${word.word}-${word.startTime}`;
                    if (allSelected) {
                      newSelected.delete(wordId);
                    } else {
                      newSelected.add(wordId);
                    }
                  });
                  setSelectedWords(newSelected);
                }}
                className="text-yellow-400 text-sm font-medium hover:text-yellow-300 transition-colors"
              >
                {levelWords.every(word => 
                  selectedWords.has(word.id || `${word.word}-${word.startTime}`)
                ) ? 'Remove all' : 'Add all'}
              </button>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {levelWords.map((word) => (
                  <button
                    key={word.id || `${word.word}-${word.startTime}`}
                    onClick={() => {
                      const newSelected = new Set(selectedWords);
                      const wordId = word.id || `${word.word}-${word.startTime}`;
                      if (newSelected.has(wordId)) {
                        newSelected.delete(wordId);
                      } else {
                        newSelected.add(wordId);
                      }
                      setSelectedWords(newSelected);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedWord(word);
                      loadDefinition(word.word);
                      setTranslation(null);
                      setShowDefinition(true);
                    }}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      selectedWords.has(word.id || `${word.word}-${word.startTime}`)
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {word.word}
                  </button>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Definition Modal */}
      {showDefinition && selectedWord && definition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedWord.word}</h3>
                {definition.phonetic && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400">{definition.phonetic}</span>
                    {definition.phonetics?.find(p => p.audio) && (
                      <button
                        onClick={() => {
                          const audio = definition.phonetics?.find(p => p.audio)?.audio;
                          if (audio) {
                            new Audio(audio).play();
                          }
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowDefinition(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Translation Section */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <select
                    value={selectedLanguage.code}
                    onChange={(e) => {
                      const lang = LANGUAGES.find(l => l.code === e.target.value);
                      if (lang) {
                        setSelectedLanguage(lang);
                        setTranslation(null);ThanasdHow
                      }
                    }}
                    className="bg-gray-600 text-white rounded-lg px-3 py-1"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </button>
                </div>
                {translation && (
                  <div className="space-y-2">
                    <p className="font-medium">{translation.word}</p>
                    {translation.sentence && (
                      <p className="text-gray-400 italic">{translation.sentence}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Example from Content */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Example from content:</h4>
                <p className="text-gray-300 italic mb-1">{selectedWord.sentence}</p>
                <p className="text-sm text-gray-400">
                  {selectedWord.startTime} - {selectedWord.endTime}
                </p>
              </div>

              {/* Definitions */}
              <div className="space-y-4">
                {definition.meanings.map((meaning, index) => (
                  <div key={index}>
                    <p className="text-yellow-400 font-medium">{meaning.partOfSpeech}</p>
                    {meaning.definitions.map((def, i) => (
                      <div key={i} className="mt-2">
                        <p className="text-gray-300">{def.definition}</p>
                        {def.example && (
                          <p className="text-gray-400 mt-1 italic">"{def.example}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Library Button */}
      {selectedWords.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800">
          <button 
            className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
            onClick={() => {
              // TODO: Implement save to library
              setSelectedWords(new Set());
            }}
          >
            Add {selectedWords.size} words to library
          </button>
        </div>
      )}
    </div>
  );
};

export default Words;