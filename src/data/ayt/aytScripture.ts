/**
 * Access layer for the bundled Alkitab Yang Terbuka (AYT) scripture text.
 *
 * Every string returned here is the exact AYT wording as published by Yayasan Lembaga SABDA
 * (YLSA), taken from the upstream dataset and compiled by `scripts/ayt-build.mjs`. Nothing in
 * this module generates, interpolates, paraphrases or augments scripture — a lookup either
 * resolves to authentic AYT text or returns `null`/`undefined` so the caller can show an honest
 * "text unavailable" notice.
 *
 * Licensing — see ./AYT.LICENSE.html and ./PROVENANCE.md
 *   AYT text is © 2011-2024 YLSA-AYT. AYT states that "usage (non-commercial) is CopyLefted ...
 *   to allow free usage/distribution of the text", with derivatives under CC BY-NC-SA.
 *   This application is a non-commercial personal use application and ships this text on those
 *   terms, with the upstream copyright notice preserved. Commercial use requires permission
 *   from YLSA (https://ayt.co).
 */
import aytRaw from './AYT.verses.json?raw';

export interface AytMetadata {
  translation: 'AYT';
  translationName: string;
  copyrightHolder: string;
  copyright: string;
  license: string;
  sourceUrl: string;
  sourceArtifact: string;
  sourceCommit: string;
  sourceChecksum: string;
  bookCount: number;
  verseCount: number;
  canonicalVerseTotal: number;
  /** SHA-256 of the compiled verse payload; lets a test detect post-build tampering. */
  datasetChecksum: string;
}

interface AytPayload {
  meta: AytMetadata;
  /** bookId -> chapters[][] -> verse text, where position implies the 1-based verse number. */
  books: Record<string, string[][]>;
}

const payload = JSON.parse(aytRaw) as AytPayload;
const AYT_BOOKS = payload.books;

/** Provenance and licensing details for the bundled AYT text. */
export const AYT_META: AytMetadata = payload.meta;

/** The AYT text bundled with this build is complete: all 66 books, Genesis 1:1 to Revelation 22:21. */
export const AYT_BOOK_COUNT = payload.meta.bookCount;
export const AYT_VERSE_COUNT = payload.meta.verseCount;

/** Whether AYT text is bundled for a book. */
export function hasAytBook(bookId: string): boolean {
  return Object.prototype.hasOwnProperty.call(AYT_BOOKS, bookId.toUpperCase());
}

/**
 * Returns the authentic AYT verse texts of a chapter in verse order,
 * or `null` when no AYT text is available for that book/chapter.
 */
export function getAytChapterVerses(bookId: string, chapter: number): string[] | null {
  const book = AYT_BOOKS[bookId.toUpperCase()];
  if (!book) return null;
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.length) return null;
  return book[chapter - 1];
}

/**
 * Returns the exact AYT text of a single verse, or `null` when it is not available.
 * A verse number must fall inside the chapter's real verse range; out-of-range lookups
 * never produce substituted text.
 */
export function getAytVerseText(bookId: string, chapter: number, verse: number): string | null {
  const verses = getAytChapterVerses(bookId, chapter);
  if (!verses) return null;
  if (!Number.isInteger(verse) || verse < 1 || verse > verses.length) return null;
  return verses[verse - 1] ?? null;
}

/** Number of AYT chapters bundled for a book (0 when the book is absent). */
export function getAytChapterCount(bookId: string): number {
  return AYT_BOOKS[bookId.toUpperCase()]?.length ?? 0;
}

/** Per-chapter verse counts for a book, in chapter order. Empty when the book is absent. */
export function getAytChapterVerseCounts(bookId: string): number[] {
  const book = AYT_BOOKS[bookId.toUpperCase()];
  if (!book) return [];
  return book.map(chapter => chapter.length);
}

/** Every book id that has bundled AYT text, in the dataset's canonical order. */
export function getAytBookIds(): string[] {
  return Object.keys(AYT_BOOKS);
}

/** Consecutive verse numbers (1..n) present in a chapter, or an empty array when unavailable. */
export function getAytVerseNumbers(bookId: string, chapter: number): number[] {
  const verses = getAytChapterVerses(bookId, chapter);
  if (!verses) return [];
  return verses.map((_, index) => index + 1);
}
