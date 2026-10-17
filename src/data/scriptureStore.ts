import { BIBLE_BOOKS, getBookById, getNextBook, getVerseCount } from './bibleData';
import { getAytChapterVerses, getAytVerseText } from './ayt/aytScripture';

export type Translation = 'WEB' | 'AYT';

export interface Verse {
  verseNumber: number;
  text: string;
}

export interface ChapterText {
  bookId: string;
  chapter: number;
  verses: Verse[];
}

export interface PassageResult {
  bookId: string;
  bookName: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  translation: Translation;
  fullText: string;
  verses: Verse[];
  /** False when no authentic text is bundled for the requested passage. */
  textAvailable: boolean;
  reference: string;
  isLastChapterInBook: boolean;
  isEndOfBible: boolean;
}


/**
 * Message shown when a verse has no authentic bundled text.
 *
 * This replaced the former procedural generator, which fabricated scripture-shaped sentences for
 * any chapter that had no local text. Inventing scripture is never acceptable, so a missing verse
 * is now reported honestly and no substitute text is produced.
 */
export const UNAVAILABLE_TEXT_MESSAGE: Record<Translation, string> = {
  AYT: 'Teks Alkitab belum tersedia untuk ayat ini. Aplikasi tidak membuat teks Alkitab tiruan.',
  WEB: 'Teks terjemahan bahasa Inggris (WEB) tidak tersedia. Aplikasi hanya menyediakan terjemahan bahasa Indonesia (AYT).',
};

/**
 * Retrieves the authentic verses available for a chapter in the requested translation.
 *
 * AYT is complete (all 66 books, 31,102 verses), so an AYT chapter always resolves.
 */
export function getChapterVerses(bookId: string, chapter: number, lang: Translation = 'AYT'): Verse[] {
  const upperBookId = bookId.toUpperCase();

  if (lang === 'AYT') {
    const texts = getAytChapterVerses(upperBookId, chapter);
    if (!texts) return [];
    // Verse numbers are validated contiguous from 1, so the array index is the verse number.
    return texts.map((text, index) => ({ verseNumber: index + 1, text }));
  }

  return [];
}

/**
 * Loads a passage slice (e.g. from startVerse to endVerse, or whole chapter).
 */
export function getPassage(
  bookId: string,
  chapter: number,
  startVerse?: number,
  endVerse?: number,
  lang: Translation = 'AYT'
): PassageResult {
  const book = getBookById(bookId) || BIBLE_BOOKS[0];
  const allVerses = getChapterVerses(book.id, chapter, lang);

  // The whole chapter's real verse count, used only to decide whether a selection is the full
  // chapter. The selectable range is clamped separately, below.
  const expectedVerseCount = getVerseCount(book.id, chapter);
  const minVerse = allVerses[0]?.verseNumber ?? 1;
  // Clamp to the verses that actually have authentic text, so the reported range never
  // advertises verses the app cannot supply.
  const maxVerse = allVerses[allVerses.length - 1]?.verseNumber ?? expectedVerseCount;

  const start = Math.max(minVerse, Math.min(startVerse ?? minVerse, maxVerse));
  const end = Math.max(start, Math.min(endVerse ?? maxVerse, maxVerse));

  const selectedVerses = allVerses.filter(v => v.verseNumber >= start && v.verseNumber <= end);

  const fullText = selectedVerses.map(v => v.text).join(' ');
  const textAvailable = selectedVerses.length > 0;

  const bookName = book.nameId;
  const actualStart = selectedVerses[0]?.verseNumber ?? start;
  const actualEnd = selectedVerses[selectedVerses.length - 1]?.verseNumber ?? end;

  const isFullChapter = actualStart === 1 && actualEnd === expectedVerseCount;
  const reference = isFullChapter
    ? `${bookName} ${chapter}`
    : actualStart === actualEnd
    ? `${bookName} ${chapter}:${actualStart}`
    : `${bookName} ${chapter}:${actualStart}-${actualEnd}`;

  const isLastChapterInBook = chapter >= book.totalChapters;
  const isEndOfBible = isLastChapterInBook && book.order >= 66;

  return {
    bookId: book.id,
    bookName,
    chapter,
    startVerse: start,
    endVerse: end,
    translation: lang,
    fullText,
    verses: selectedVerses,
    textAvailable,
    reference,
    isLastChapterInBook,
    isEndOfBible,
  };
}

/**
 * Computes next unit location according to practice mode.
 */
export function getNextUnitLocation(
  mode: 'single' | 'book' | 'continuous',
  currentBookId: string,
  currentChapter: number
): { bookId: string; chapter: number; startVerse: number; hasNext: boolean } {
  if (mode === 'single') {
    return { bookId: currentBookId, chapter: currentChapter, startVerse: 1, hasNext: false };
  }

  const currentBook = getBookById(currentBookId);
  if (!currentBook) {
    return { bookId: 'GEN', chapter: 1, startVerse: 1, hasNext: false };
  }

  // Within the same book: go to next chapter
  if (currentChapter < currentBook.totalChapters) {
    return {
      bookId: currentBook.id,
      chapter: currentChapter + 1,
      startVerse: 1,
      hasNext: true,
    };
  }

  // At the end of the book:
  if (mode === 'book') {
    // Book mode ends when book is finished
    return { bookId: currentBook.id, chapter: currentChapter, startVerse: 1, hasNext: false };
  }

  // Continuous mode: proceed to the next book chapter 1
  const nextBook = getNextBook(currentBook.id);
  if (nextBook) {
    return {
      bookId: nextBook.id,
      chapter: 1,
      startVerse: 1,
      hasNext: true,
    };
  }

  // End of Revelation reached!
  return {
    bookId: currentBook.id,
    chapter: currentChapter,
    startVerse: 1,
    hasNext: false,
  };
}

export interface VerseResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string; // e.g. "Kidung Agung 1:1"
  text: string;
  translation: Translation;
  totalVersesInChapter: number;
  /** False when no authentic text is bundled for this verse. */
  textAvailable: boolean;
  isFirstVerseInChapter: boolean;
  isLastVerseInChapter: boolean;
  isFirstVerseInBook: boolean;
  isLastVerseInBook: boolean;
  isStartOfBible: boolean;
  isEndOfBible: boolean;
}

/**
 * Retrieves a single verse with exact reference and metadata.
 */
export function getVerse(
  bookId: string,
  chapter: number,
  verse: number,
  lang: Translation = 'AYT'
): VerseResult {
  const book = getBookById(bookId) || BIBLE_BOOKS[0];
  const clampedChapter = Math.max(1, Math.min(chapter, book.totalChapters));
  const totalVerses = getVerseCount(book.id, clampedChapter);
  const clampedVerse = Math.max(1, Math.min(verse, totalVerses));

  // Only authentic AYT text is supported and bundled. Never synthesise a substitute for a missing one.
  const authenticText =
    lang === 'AYT' ? getAytVerseText(book.id, clampedChapter, clampedVerse) : null;

  const textAvailable = authenticText !== null;
  const text = authenticText ?? (UNAVAILABLE_TEXT_MESSAGE[lang] || UNAVAILABLE_TEXT_MESSAGE.AYT);

  const bookName = book.nameId;
  const reference = `${bookName} ${clampedChapter}:${clampedVerse}`;

  const isFirstVerseInChapter = clampedVerse === 1;
  const isLastVerseInChapter = clampedVerse === totalVerses;
  const isFirstVerseInBook = clampedChapter === 1 && isFirstVerseInChapter;
  const isLastVerseInBook = clampedChapter === book.totalChapters && isLastVerseInChapter;
  const isStartOfBible = book.order === 1 && isFirstVerseInBook;
  const isEndOfBible = book.order === 66 && isLastVerseInBook;

  return {
    bookId: book.id,
    bookName,
    chapter: clampedChapter,
    verse: clampedVerse,
    reference,
    text,
    translation: lang,
    totalVersesInChapter: totalVerses,
    textAvailable,
    isFirstVerseInChapter,
    isLastVerseInChapter,
    isFirstVerseInBook,
    isLastVerseInBook,
    isStartOfBible,
    isEndOfBible,
  };
}

