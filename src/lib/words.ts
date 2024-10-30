export enum WordLevel {
  Proficiency = "C2",
  Advanced = "C1",
  UpperIntermediate = "B2",
  Intermediate = "B1",
  Elementary = "A2",
  Beginner = "A1"
}

export interface Word {
  id?: string;
  word: string;
  related?: string[];
  pos: string;
  sentence: string;
  startTime: string;
  endTime: string;
  rank: number;
  translation?: WordTranslation;
}

export interface WordTranslation {
  language: string;
  word: string;
  sentence?: string;
}

export interface Words {
  [WordLevel.Proficiency]: Word[];
  [WordLevel.Advanced]: Word[];
  [WordLevel.UpperIntermediate]: Word[];
  [WordLevel.Intermediate]: Word[];
  [WordLevel.Elementary]: Word[];
  [WordLevel.Beginner]: Word[];
}

export interface WordDefinition {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }>;
  }>;
}

export interface SubtitleAnalysis {
  meta?: {
    words: number;
    mean: number;
    max: number;
    levels: {
      A1: number;
      A2: number;
      B1: number;
      B2: number;
      C1: number;
      C2: number;
    };
    grade: string;
  };
  words?: {
    A1: Word[];
    A2: Word[];
    B1: Word[];
    B2: Word[];
    C1: Word[];
    C2: Word[];
  };
}