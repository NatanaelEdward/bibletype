import { describe, it, expect } from 'vitest';
import {
  getNextVersePosition,
  getPrevVersePosition,
  getVerseCount,
  getBookById,
} from '../data/bibleData';
import { getVerse } from '../data/scriptureStore';

describe('Verse Progression & Bible Reference Navigation', () => {
  it('advances sequentially within a chapter (e.g. Kidung Agung 1:1 to 1:2)', () => {
    // Song of Solomon / Kidung Agung 1:1
    const next1 = getNextVersePosition('SNG', 1, 1);
    expect(next1.bookId).toBe('SNG');
    expect(next1.chapter).toBe(1);
    expect(next1.verse).toBe(2);
    expect(next1.isEnd).toBe(false);

    // Kidung Agung 1:2 to 1:3
    const next2 = getNextVersePosition('SNG', 1, 2);
    expect(next2.bookId).toBe('SNG');
    expect(next2.chapter).toBe(1);
    expect(next2.verse).toBe(3);
    expect(next2.isEnd).toBe(false);
  });

  it('advances to verse 1 of next chapter when reaching the final verse of a chapter', () => {
    // Kidung Agung chapter 1 has 17 verses
    const verseCountCh1 = getVerseCount('SNG', 1);
    expect(verseCountCh1).toBe(17);

    // Kidung Agung 1:17 -> Kidung Agung 2:1
    const next = getNextVersePosition('SNG', 1, 17);
    expect(next.bookId).toBe('SNG');
    expect(next.chapter).toBe(2);
    expect(next.verse).toBe(1);
    expect(next.isEnd).toBe(false);
  });

  it('advances to chapter 1 verse 1 of the next book when reaching the final chapter of a book', () => {
    // Kidung Agung has 8 chapters. Chapter 8 has 14 verses.
    const sng = getBookById('SNG');
    expect(sng?.totalChapters).toBe(8);
    const lastVerseCh8 = getVerseCount('SNG', 8);
    expect(lastVerseCh8).toBe(14);

    // Kidung Agung 8:14 -> Next book in Bible order is Isaiah (ISA) 1:1
    const next = getNextVersePosition('SNG', 8, 14);
    expect(next.bookId).toBe('ISA');
    expect(next.chapter).toBe(1);
    expect(next.verse).toBe(1);
    expect(next.isEnd).toBe(false);
  });

  it('crosses Old Testament to New Testament boundary correctly (Malachi to Matthew)', () => {
    // Malachi (book 39) has 4 chapters, chapter 4 has 6 verses
    const malVerseCount = getVerseCount('MAL', 4);
    expect(malVerseCount).toBe(6);

    const next = getNextVersePosition('MAL', 4, 6);
    expect(next.bookId).toBe('MAT');
    expect(next.chapter).toBe(1);
    expect(next.verse).toBe(1);
    expect(next.isEnd).toBe(false);
  });

  it('stops safely at the final verse of Revelation (Rev 22:21) with isEnd flag', () => {
    // Revelation has 22 chapters, chapter 22 has 21 verses
    const revVerseCount = getVerseCount('REV', 22);
    expect(revVerseCount).toBe(21);

    const next = getNextVersePosition('REV', 22, 21);
    expect(next.bookId).toBe('REV');
    expect(next.chapter).toBe(22);
    expect(next.verse).toBe(21);
    expect(next.isEnd).toBe(true);
  });

  it('navigates backward within a chapter correctly', () => {
    const prev = getPrevVersePosition('SNG', 1, 3);
    expect(prev.bookId).toBe('SNG');
    expect(prev.chapter).toBe(1);
    expect(prev.verse).toBe(2);
    expect(prev.isStart).toBe(false);
  });

  it('navigates backward across chapter boundaries correctly', () => {
    // Kidung Agung 2:1 backward -> Kidung Agung 1:17
    const prev = getPrevVersePosition('SNG', 2, 1);
    expect(prev.bookId).toBe('SNG');
    expect(prev.chapter).toBe(1);
    expect(prev.verse).toBe(17);
    expect(prev.isStart).toBe(false);
  });

  it('navigates backward across book boundaries correctly', () => {
    // Isaiah 1:1 backward -> Kidung Agung 8:14
    const prev = getPrevVersePosition('ISA', 1, 1);
    expect(prev.bookId).toBe('SNG');
    expect(prev.chapter).toBe(8);
    expect(prev.verse).toBe(14);
    expect(prev.isStart).toBe(false);
  });

  it('stops safely at Genesis 1:1 with isStart flag', () => {
    const prev = getPrevVersePosition('GEN', 1, 1);
    expect(prev.bookId).toBe('GEN');
    expect(prev.chapter).toBe(1);
    expect(prev.verse).toBe(1);
    expect(prev.isStart).toBe(true);
  });

  it('retrieves accurate authentic verse text for Kidung Agung in Indonesian (AYT)', () => {
    const aytVerse = getVerse('SNG', 1, 1, 'AYT');
    expect(aytVerse.reference).toBe('Kidung Agung 1:1');
    // Exact AYT wording as published by YLSA (see src/data/ayt/PROVENANCE.md).
    expect(aytVerse.text).toBe('Nyanyian di atas segala nyanyian dari Salomo.');
    expect(aytVerse.textAvailable).toBe(true);

    const nextVerse = getVerse('SNG', 1, 2, 'AYT');
    expect(nextVerse.reference).toBe('Kidung Agung 1:2');
    expect(nextVerse.textAvailable).toBe(true);
  });
});
