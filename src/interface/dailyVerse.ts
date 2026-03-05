export interface IDailyVerse {
  _id: string;
  date: Date;
  book: string;
  chapter: number;
  verseRange: string;
  text: string;
  translation: string;
  theme?: string;
}
