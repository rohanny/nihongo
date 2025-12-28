import { Kana, UserProgress } from './types';
import characterData from './data/characters.json';

const HIRAGANA = characterData.hiragana as Kana[];
const HIRAGANA_DAKUTEN = characterData.hiragana_dakuten as Kana[];
const KATAKANA = characterData.katakana as Kana[];
const KATAKANA_DAKUTEN = characterData.katakana_dakuten as Kana[];
const KANJI_N5 = characterData.kanji_n5 as Kana[];

export const ALL_CHARACTERS: Kana[] = [...HIRAGANA, ...HIRAGANA_DAKUTEN, ...KATAKANA, ...KATAKANA_DAKUTEN, ...KANJI_N5];

export const INITIAL_PROGRESS: UserProgress = {
  learned: [],
  revisionList: [],
  dailyProgress: {
    date: new Date().toISOString().split('T')[0],
    count: 0
  },
  settings: {
    dailyGoal: 5
  }
};