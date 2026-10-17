import { describe, it, expect } from 'vitest';
import { getNextUnitLocation, getPassage } from '../data/scriptureStore';

describe('Navigation Logic', () => {
  it('does not advance to another chapter in Single mode', () => {
    const next = getNextUnitLocation('single', 'GEN', 1);
    expect(next.hasNext).toBe(false);
  });

  it('advances to next chapter within same book in Book mode', () => {
    const next = getNextUnitLocation('book', 'GEN', 1);
    expect(next.hasNext).toBe(true);
    expect(next.bookId).toBe('GEN');
    expect(next.chapter).toBe(2);
  });

  it('stops at the end of the book in Book mode without crossing into the next book', () => {
    // Genesis has 50 chapters
    const next = getNextUnitLocation('book', 'GEN', 50);
    expect(next.hasNext).toBe(false);
    expect(next.bookId).toBe('GEN');
    expect(next.chapter).toBe(50);
  });

  it('advances sequentially within book in Continuous mode', () => {
    const next = getNextUnitLocation('continuous', 'JHN', 3);
    expect(next.hasNext).toBe(true);
    expect(next.bookId).toBe('JHN');
    expect(next.chapter).toBe(4);
  });

  it('crosses book boundaries correctly in Continuous mode (e.g. Malachi to Matthew)', () => {
    // Malachi is book 39 (last OT book), has 4 chapters
    const next = getNextUnitLocation('continuous', 'MAL', 4);
    expect(next.hasNext).toBe(true);
    expect(next.bookId).toBe('MAT');
    expect(next.chapter).toBe(1);
  });

  it('crosses from Jude to Revelation in Continuous mode', () => {
    // Jude has 1 chapter
    const next = getNextUnitLocation('continuous', 'JUD', 1);
    expect(next.hasNext).toBe(true);
    expect(next.bookId).toBe('REV');
    expect(next.chapter).toBe(1);
  });

  it('terminates at the end of Revelation (Rev 22) in Continuous mode', () => {
    // Revelation has 22 chapters
    const next = getNextUnitLocation('continuous', 'REV', 22);
    expect(next.hasNext).toBe(false);
  });

  it('correctly handles passage verse slicing for starting verse', () => {
    // Yohanes 3 starting at verse 16 to 18
    const passage = getPassage('JHN', 3, 16, 18, 'AYT');
    expect(passage.startVerse).toBe(16);
    expect(passage.reference).toContain('Yohanes 3:16');
    expect(passage.fullText).toContain('Karena Allah sangat mengasihi dunia ini');
    expect(passage.textAvailable).toBe(true);
    expect(passage.verses.map(v => v.verseNumber)).toEqual([16, 17, 18]);
  });

  it('supports Indonesian translation retrieval cleanly', () => {
    const passage = getPassage('JHN', 3, 16, undefined, 'AYT');
    expect(passage.translation).toBe('AYT');
    expect(passage.reference).toContain('Yohanes 3:16');
    // Exact AYT wording for Yohanes 3:16 as published by YLSA.
    expect(passage.fullText).toContain('Karena Allah sangat mengasihi dunia ini');
    expect(passage.textAvailable).toBe(true);
    // Yohanes 3 has 36 verses and AYT covers the whole chapter.
    expect(passage.verses[0].verseNumber).toBe(16);
    expect(passage.verses[passage.verses.length - 1].verseNumber).toBe(36);
  });
});
