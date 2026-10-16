export interface BookMetadata {
  id: string; // Standard 3-letter code, e.g. 'GEN'
  nameEn: string;
  nameId: string;
  testament: 'OT' | 'NT';
  order: number; // 1 to 66
  totalChapters: number;
  chapterVerses: number[]; // Array of verse counts for each chapter (1-indexed mapping)
}

export const BIBLE_BOOKS: BookMetadata[] = [
  // Old Testament (39 books)
  { id: 'GEN', nameEn: 'Genesis', nameId: 'Kejadian', testament: 'OT', order: 1, totalChapters: 50, chapterVerses: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26] },
  { id: 'EXO', nameEn: 'Exodus', nameId: 'Keluaran', testament: 'OT', order: 2, totalChapters: 40, chapterVerses: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38] },
  { id: 'LEV', nameEn: 'Leviticus', nameId: 'Imamat', testament: 'OT', order: 3, totalChapters: 27, chapterVerses: [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34] },
  { id: 'NUM', nameEn: 'Numbers', nameId: 'Bilangan', testament: 'OT', order: 4, totalChapters: 36, chapterVerses: [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13] },
  { id: 'DEU', nameEn: 'Deuteronomy', nameId: 'Ulangan', testament: 'OT', order: 5, totalChapters: 34, chapterVerses: [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12] },
  { id: 'JOS', nameEn: 'Joshua', nameId: 'Yosua', testament: 'OT', order: 6, totalChapters: 24, chapterVerses: [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33] },
  { id: 'JDG', nameEn: 'Judges', nameId: 'Hakim-hakim', testament: 'OT', order: 7, totalChapters: 21, chapterVerses: [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25] },
  { id: 'RUT', nameEn: 'Ruth', nameId: 'Rut', testament: 'OT', order: 8, totalChapters: 4, chapterVerses: [22, 23, 18, 22] },
  { id: '1SA', nameEn: '1 Samuel', nameId: '1 Samuel', testament: 'OT', order: 9, totalChapters: 31, chapterVerses: [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13] },
  { id: '2SA', nameEn: '2 Samuel', nameId: '2 Samuel', testament: 'OT', order: 10, totalChapters: 24, chapterVerses: [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25] },
  { id: '1KI', nameEn: '1 Kings', nameId: '1 Raja-raja', testament: 'OT', order: 11, totalChapters: 22, chapterVerses: [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53] },
  { id: '2KI', nameEn: '2 Kings', nameId: '2 Raja-raja', testament: 'OT', order: 12, totalChapters: 25, chapterVerses: [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30] },
  { id: '1CH', nameEn: '1 Chronicles', nameId: '1 Tawarikh', testament: 'OT', order: 13, totalChapters: 29, chapterVerses: [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30] },
  { id: '2CH', nameEn: '2 Chronicles', nameId: '2 Tawarikh', testament: 'OT', order: 14, totalChapters: 36, chapterVerses: [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23] },
  { id: 'EZR', nameEn: 'Ezra', nameId: 'Ezra', testament: 'OT', order: 15, totalChapters: 10, chapterVerses: [11, 70, 13, 24, 17, 22, 28, 36, 15, 44] },
  { id: 'NEH', nameEn: 'Nehemiah', nameId: 'Nehemia', testament: 'OT', order: 16, totalChapters: 13, chapterVerses: [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31] },
  { id: 'EST', nameEn: 'Esther', nameId: 'Ester', testament: 'OT', order: 17, totalChapters: 10, chapterVerses: [22, 23, 15, 17, 14, 14, 10, 17, 32, 3] },
  { id: 'JOB', nameEn: 'Job', nameId: 'Ayub', testament: 'OT', order: 18, totalChapters: 42, chapterVerses: [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17] },
  { id: 'PSA', nameEn: 'Psalms', nameId: 'Mazmur', testament: 'OT', order: 19, totalChapters: 150, chapterVerses: [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6] },
  { id: 'PRO', nameEn: 'Proverbs', nameId: 'Amsal', testament: 'OT', order: 20, totalChapters: 31, chapterVerses: [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31] },
  { id: 'ECC', nameEn: 'Ecclesiastes', nameId: 'Pengkhotbah', testament: 'OT', order: 21, totalChapters: 12, chapterVerses: [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14] },
  { id: 'SNG', nameEn: 'Song of Solomon', nameId: 'Kidung Agung', testament: 'OT', order: 22, totalChapters: 8, chapterVerses: [17, 17, 11, 16, 16, 13, 13, 14] },
  { id: 'ISA', nameEn: 'Isaiah', nameId: 'Yesaya', testament: 'OT', order: 23, totalChapters: 66, chapterVerses: [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24] },
  { id: 'JER', nameEn: 'Jeremiah', nameId: 'Yeremia', testament: 'OT', order: 24, totalChapters: 52, chapterVerses: [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34] },
  { id: 'LAM', nameEn: 'Lamentations', nameId: 'Ratapan', testament: 'OT', order: 25, totalChapters: 5, chapterVerses: [22, 22, 66, 22, 22] },
  { id: 'EZK', nameEn: 'Ezekiel', nameId: 'Yehezkiel', testament: 'OT', order: 26, totalChapters: 48, chapterVerses: [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35] },
  { id: 'DAN', nameEn: 'Daniel', nameId: 'Daniel', testament: 'OT', order: 27, totalChapters: 12, chapterVerses: [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13] },
  { id: 'HOS', nameEn: 'Hosea', nameId: 'Hosea', testament: 'OT', order: 28, totalChapters: 14, chapterVerses: [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9] },
  { id: 'JOL', nameEn: 'Joel', nameId: 'Yoel', testament: 'OT', order: 29, totalChapters: 3, chapterVerses: [20, 32, 21] },
  { id: 'AMO', nameEn: 'Amos', nameId: 'Amos', testament: 'OT', order: 30, totalChapters: 9, chapterVerses: [15, 16, 15, 13, 27, 14, 17, 14, 15] },
  { id: 'OBA', nameEn: 'Obadiah', nameId: 'Obaja', testament: 'OT', order: 31, totalChapters: 1, chapterVerses: [21] },
  { id: 'JON', nameEn: 'Jonah', nameId: 'Yunus', testament: 'OT', order: 32, totalChapters: 4, chapterVerses: [17, 10, 10, 11] },
  { id: 'MIC', nameEn: 'Micah', nameId: 'Mikha', testament: 'OT', order: 33, totalChapters: 7, chapterVerses: [16, 13, 12, 13, 15, 16, 20] },
  { id: 'NAM', nameEn: 'Nahum', nameId: 'Nahum', testament: 'OT', order: 34, totalChapters: 3, chapterVerses: [15, 13, 19] },
  { id: 'HAB', nameEn: 'Habakkuk', nameId: 'Habakuk', testament: 'OT', order: 35, totalChapters: 3, chapterVerses: [17, 20, 19] },
  { id: 'ZEP', nameEn: 'Zephaniah', nameId: 'Zefanya', testament: 'OT', order: 36, totalChapters: 3, chapterVerses: [18, 15, 20] },
  { id: 'HAG', nameEn: 'Haggai', nameId: 'Hagai', testament: 'OT', order: 37, totalChapters: 2, chapterVerses: [15, 23] },
  { id: 'ZEC', nameEn: 'Zechariah', nameId: 'Zakharia', testament: 'OT', order: 38, totalChapters: 14, chapterVerses: [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21] },
  { id: 'MAL', nameEn: 'Malachi', nameId: 'Maleakhi', testament: 'OT', order: 39, totalChapters: 4, chapterVerses: [14, 17, 18, 6] },

  // New Testament (27 books)
  { id: 'MAT', nameEn: 'Matthew', nameId: 'Matius', testament: 'NT', order: 40, totalChapters: 28, chapterVerses: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20] },
  { id: 'MRK', nameEn: 'Mark', nameId: 'Markus', testament: 'NT', order: 41, totalChapters: 16, chapterVerses: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20] },
  { id: 'LUK', nameEn: 'Luke', nameId: 'Lukas', testament: 'NT', order: 42, totalChapters: 24, chapterVerses: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53] },
  { id: 'JHN', nameEn: 'John', nameId: 'Yohanes', testament: 'NT', order: 43, totalChapters: 21, chapterVerses: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25] },
  { id: 'ACT', nameEn: 'Acts', nameId: 'Kisah Para Rasul', testament: 'NT', order: 44, totalChapters: 28, chapterVerses: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31] },
  { id: 'ROM', nameEn: 'Romans', nameId: 'Roma', testament: 'NT', order: 45, totalChapters: 16, chapterVerses: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27] },
  { id: '1CO', nameEn: '1 Corinthians', nameId: '1 Korintus', testament: 'NT', order: 46, totalChapters: 16, chapterVerses: [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24] },
  { id: '2CO', nameEn: '2 Corinthians', nameId: '2 Korintus', testament: 'NT', order: 47, totalChapters: 13, chapterVerses: [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14] },
  { id: 'GAL', nameEn: 'Galatians', nameId: 'Galatia', testament: 'NT', order: 48, totalChapters: 6, chapterVerses: [24, 21, 29, 31, 26, 18] },
  { id: 'EPH', nameEn: 'Ephesians', nameId: 'Efesus', testament: 'NT', order: 49, totalChapters: 6, chapterVerses: [23, 22, 21, 32, 33, 24] },
  { id: 'PHP', nameEn: 'Philippians', nameId: 'Filipi', testament: 'NT', order: 50, totalChapters: 4, chapterVerses: [30, 30, 21, 23] },
  { id: 'COL', nameEn: 'Colossians', nameId: 'Kolose', testament: 'NT', order: 51, totalChapters: 4, chapterVerses: [29, 23, 25, 18] },
  { id: '1TH', nameEn: '1 Thessalonians', nameId: '1 Tesalonika', testament: 'NT', order: 52, totalChapters: 5, chapterVerses: [10, 20, 13, 18, 28] },
  { id: '2TH', nameEn: '2 Thessalonians', nameId: '2 Tesalonika', testament: 'NT', order: 53, totalChapters: 3, chapterVerses: [12, 17, 18] },
  { id: '1TI', nameEn: '1 Timothy', nameId: '1 Timotius', testament: 'NT', order: 54, totalChapters: 6, chapterVerses: [20, 15, 16, 16, 25, 21] },
  { id: '2TI', nameEn: '2 Timothy', nameId: '2 Timotius', testament: 'NT', order: 55, totalChapters: 4, chapterVerses: [18, 26, 17, 22] },
  { id: 'TIT', nameEn: 'Titus', nameId: 'Titus', testament: 'NT', order: 56, totalChapters: 3, chapterVerses: [16, 15, 15] },
  { id: 'PHM', nameEn: 'Philemon', nameId: 'Filemon', testament: 'NT', order: 57, totalChapters: 1, chapterVerses: [25] },
  { id: 'HEB', nameEn: 'Hebrews', nameId: 'Ibrani', testament: 'NT', order: 58, totalChapters: 13, chapterVerses: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25] },
  { id: 'JAS', nameEn: 'James', nameId: 'Yakobus', testament: 'NT', order: 59, totalChapters: 5, chapterVerses: [27, 26, 18, 17, 20] },
  { id: '1PE', nameEn: '1 Peter', nameId: '1 Petrus', testament: 'NT', order: 60, totalChapters: 5, chapterVerses: [25, 25, 22, 19, 14] },
  { id: '2PE', nameEn: '2 Peter', nameId: '2 Petrus', testament: 'NT', order: 61, totalChapters: 3, chapterVerses: [21, 22, 18] },
  { id: '1JN', nameEn: '1 John', nameId: '1 Yohanes', testament: 'NT', order: 62, totalChapters: 5, chapterVerses: [10, 29, 24, 21, 21] },
  { id: '2JN', nameEn: '2 John', nameId: '2 Yohanes', testament: 'NT', order: 63, totalChapters: 1, chapterVerses: [13] },
  { id: '3JN', nameEn: '3 John', nameId: '3 Yohanes', testament: 'NT', order: 64, totalChapters: 1, chapterVerses: [14] },
  { id: 'JUD', nameEn: 'Jude', nameId: 'Yudas', testament: 'NT', order: 65, totalChapters: 1, chapterVerses: [25] },
  { id: 'REV', nameEn: 'Revelation', nameId: 'Wahyu', testament: 'NT', order: 66, totalChapters: 22, chapterVerses: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21] },
];

export function getBookById(id: string): BookMetadata | undefined {
  return BIBLE_BOOKS.find(b => b.id.toUpperCase() === id.toUpperCase());
}

export function getBookByOrder(order: number): BookMetadata | undefined {
  return BIBLE_BOOKS.find(b => b.order === order);
}

export function getNextBook(currentBookId: string): BookMetadata | null {
  const current = getBookById(currentBookId);
  if (!current) return null;
  if (current.order >= 66) return null;
  return getBookByOrder(current.order + 1) || null;
}

export function getPrevBook(currentBookId: string): BookMetadata | null {
  const current = getBookById(currentBookId);
  if (!current) return null;
  if (current.order <= 1) return null;
  return getBookByOrder(current.order - 1) || null;
}

export function getVerseCount(bookId: string, chapter: number): number {
  const book = getBookById(bookId);
  if (!book) return 1;
  const clampedChapter = Math.max(1, Math.min(chapter, book.totalChapters));
  return book.chapterVerses[clampedChapter - 1] || 1;
}

export interface VersePosition {
  bookId: string;
  chapter: number;
  verse: number;
  isEnd?: boolean;
  isStart?: boolean;
}

/**
 * Calculates the next sequential verse across chapters and book boundaries.
 * 1. Within a chapter: advance to next verse.
 * 2. At end of chapter: advance to verse 1 of next chapter.
 * 3. At end of book: advance to chapter 1, verse 1 of next book.
 * 4. At Revelation 22:21: stops at end of Bible.
 */
export function getNextVersePosition(
  bookId: string,
  chapter: number,
  verse: number
): VersePosition {
  const currentBook = getBookById(bookId) || BIBLE_BOOKS[0];
  const totalVersesInChapter = getVerseCount(currentBook.id, chapter);

  // 1. Within current chapter
  if (verse < totalVersesInChapter) {
    return {
      bookId: currentBook.id,
      chapter,
      verse: verse + 1,
      isEnd: false,
    };
  }

  // 2. End of chapter reached: next chapter in same book
  if (chapter < currentBook.totalChapters) {
    return {
      bookId: currentBook.id,
      chapter: chapter + 1,
      verse: 1,
      isEnd: false,
    };
  }

  // 3. End of book reached: next book chapter 1, verse 1
  const nextBook = getNextBook(currentBook.id);
  if (nextBook) {
    return {
      bookId: nextBook.id,
      chapter: 1,
      verse: 1,
      isEnd: false,
    };
  }

  // 4. End of Revelation (Rev 22:21) reached
  return {
    bookId: currentBook.id,
    chapter,
    verse,
    isEnd: true,
  };
}

/**
 * Calculates the previous sequential verse across chapters and book boundaries.
 */
export function getPrevVersePosition(
  bookId: string,
  chapter: number,
  verse: number
): VersePosition {
  const currentBook = getBookById(bookId) || BIBLE_BOOKS[0];

  // 1. Within current chapter
  if (verse > 1) {
    return {
      bookId: currentBook.id,
      chapter,
      verse: verse - 1,
      isStart: false,
    };
  }

  // 2. Start of chapter reached: previous chapter's last verse
  if (chapter > 1) {
    const prevChapter = chapter - 1;
    const lastVerseInPrevChapter = getVerseCount(currentBook.id, prevChapter);
    return {
      bookId: currentBook.id,
      chapter: prevChapter,
      verse: lastVerseInPrevChapter,
      isStart: false,
    };
  }

  // 3. Start of book reached: previous book's last chapter & last verse
  const prevBook = getPrevBook(currentBook.id);
  if (prevBook) {
    const lastChapterInPrevBook = prevBook.totalChapters;
    const lastVerseInPrevBook = getVerseCount(prevBook.id, lastChapterInPrevBook);
    return {
      bookId: prevBook.id,
      chapter: lastChapterInPrevBook,
      verse: lastVerseInPrevBook,
      isStart: false,
    };
  }

  // 4. Start of Genesis (Gen 1:1) reached
  return {
    bookId: currentBook.id,
    chapter: 1,
    verse: 1,
    isStart: true,
  };
}

