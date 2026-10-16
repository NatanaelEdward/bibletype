/**
 * AYT coverage and authenticity validation.
 *
 * Three separate questions are asked, and they are deliberately not conflated:
 *
 *   1. Provenance  — is the shipped text tied to the publisher's own artifact by checksum?
 *   2. Structural  — are all 66 books, every chapter and every verse present, unique and
 *                    contiguous? A passing structure count does NOT prove the words are real.
 *   3. Textual     — does a sample verse from every book match the original source byte-for-byte,
 *                    and is there any trace of the deleted procedural generator?
 *
 * The full 31,102-verse byte comparison against the original `ayt.json` needs the downloaded
 * source, so it lives in `npm run ayt:verify`. This suite stays offline by checking recorded
 * golden samples (3 per book) plus a checksum over the entire compiled dataset.
 */
import { describe, it, expect } from 'vitest';

import licenceHtml from '../data/ayt/AYT.LICENSE.html?raw';
import provenance from '../data/ayt/PROVENANCE.md?raw';
import { BIBLE_BOOKS, getBookById, getNextVersePosition, getPrevVersePosition, getVerseCount } from '../data/bibleData';
import { getVerse, getChapterVerses, getPassage, UNAVAILABLE_TEXT_MESSAGE } from '../data/scriptureStore';
import {
  AYT_META,
  AYT_BOOK_COUNT,
  AYT_VERSE_COUNT,
  getAytBookIds,
  getAytChapterCount,
  getAytChapterVerseCounts,
  getAytVerseText,
  hasAytBook,
} from '../data/ayt/aytScripture';
import golden from '../data/ayt/AYT.golden.json';

/** SHA-256 of the publisher's `json/ayt.json`, pinned in scripts/ayt-fetch.mjs. */
const PINNED_SOURCE_SHA256 = 'fc1c9ab022fa77af17250d900bf0c175bb3d32870658af231fca7498a99112e5';
const PINNED_SOURCE_COMMIT = 'd741613e179e1ce088a83e120ea76846d0fba481';

/**
 * Wording that only the removed procedural generator could produce.
 *
 * These must stay specific to the deleted templates: scripture itself contains phrases such as
 * "kitab Mazmur pasal dua" (Kisah Para Rasul 13:33), so a bare "pasal " / "chapter " test would
 * flag authentic text. The paired regex in the leftovers test covers the full payload shape.
 */
const GENERATED_TEXT_SIGNATURES = [
  'Firman TUHAN berkenaan dengan',
  'The word of the LORD came regarding',
  'The word of the LORD in ',
  'Firman TUHAN dalam ',
  'Hiduplah setia dan berharaplah kepada Allah',
  'Walk faithfully and trust in God',
];

/** Every verse id in the canon, as `BOOK chapter:verse`, walked in reading order. */
function everyVerseId(): string[] {
  const ids: string[] = [];
  for (const book of BIBLE_BOOKS) {
    for (let chapter = 1; chapter <= book.totalChapters; chapter++) {
      for (let verse = 1; verse <= getVerseCount(book.id, chapter); verse++) {
        ids.push(`${book.id} ${chapter}:${verse}`);
      }
    }
  }
  return ids;
}

describe('AYT — provenance and licensing', () => {
  it('ties the shipped text to the publisher artifact by checksum and commit', () => {
    expect(AYT_META.sourceChecksum).toBe(PINNED_SOURCE_SHA256);
    expect(AYT_META.sourceCommit).toBe(PINNED_SOURCE_COMMIT);
    expect(AYT_META.sourceUrl).toBe('https://github.com/sabdacode/ayt');
    expect(AYT_META.sourceArtifact).toBe('json/ayt.json');
  });

  it('preserves the upstream copyright and non-commercial licence terms', () => {
    expect(AYT_META.copyrightHolder).toContain('Yayasan Lembaga SABDA');
    expect(AYT_META.copyright).toContain('YLSA-AYT');
    expect(AYT_META.license).toContain('non-commercial');
    expect(AYT_META.license).toContain('YLSA');
  });

  it('ships the upstream licence text alongside the data', () => {
    expect(licenceHtml).toContain('Yayasan Lembaga SABDA');
    expect(licenceHtml).toContain('usage (non-commercial) is CopyLefted');
    expect(licenceHtml).toContain('free usage/distribution of the text');
    expect(licenceHtml).toContain('https://ayt.co');
  });

  it('documents where the text came from and the terms it is used under', () => {
    expect(provenance).toContain(PINNED_SOURCE_SHA256);
    expect(provenance).toContain(PINNED_SOURCE_COMMIT);
    expect(provenance).toContain('non-commercial');
  });

  it('detects any post-build modification of the compiled dataset', () => {
    expect(AYT_META.datasetChecksum).toBe(golden.datasetChecksum);
  });
});

describe('AYT — structural completeness (does not by itself prove authenticity)', () => {
  it('covers exactly the 66 canonical books, in order, with no extras', () => {
    const shipped = getAytBookIds();
    expect(shipped).toHaveLength(66);
    expect(shipped).toEqual(BIBLE_BOOKS.map(b => b.id));
    expect(AYT_BOOK_COUNT).toBe(66);
    for (const book of BIBLE_BOOKS) expect(hasAytBook(book.id)).toBe(true);
  });

  it('matches every book chapter count and every chapter verse count', () => {
    for (const book of BIBLE_BOOKS) {
      expect(getAytChapterCount(book.id), `${book.id} chapter count`).toBe(book.totalChapters);
      expect(getAytChapterVerseCounts(book.id), `${book.id} chapter verse counts`).toEqual(
        book.chapterVerses
      );
    }
  });

  it('contains exactly the canonical 31,102 verses', () => {
    const total = BIBLE_BOOKS.reduce(
      (sum, book) => sum + getAytChapterVerseCounts(book.id).reduce((s, n) => s + n, 0),
      0
    );
    expect(total).toBe(31102);
    expect(AYT_VERSE_COUNT).toBe(31102);
    expect(AYT_META.canonicalVerseTotal).toBe(31102);
  });

  it('has no duplicate verse ids and no missing or empty verse', () => {
    const ids = everyVerseId();
    expect(ids).toHaveLength(31102);
    expect(new Set(ids).size).toBe(ids.length);

    const seen = new Set<string>();
    let checked = 0;
    for (const book of BIBLE_BOOKS) {
      for (let chapter = 1; chapter <= book.totalChapters; chapter++) {
        for (const verse of getChapterVerses(book.id, chapter, 'AYT')) {
          const key = `${book.id} ${chapter}:${verse.verseNumber}`;
          expect(seen.has(key), `duplicate verse id ${key}`).toBe(false);
          seen.add(key);
          expect(verse.text.trim().length, `empty text at ${key}`).toBeGreaterThan(0);
          checked++;
        }
      }
    }
    expect(checked).toBe(31102);
    expect(seen.size).toBe(31102);
  });

  it('resolves both ends of the Bible', () => {
    const first = getVerse('GEN', 1, 1, 'AYT');
    expect(first.reference).toBe('Kejadian 1:1');
    expect(first.text).toBe('Pada mulanya, Allah menciptakan langit dan bumi.');
    expect(first.isStartOfBible).toBe(true);
    expect(first.textAvailable).toBe(true);

    const last = getVerse('REV', 22, 21, 'AYT');
    expect(last.reference).toBe('Wahyu 22:21');
    expect(last.text).toBe('Anugerah Tuhan Yesus menyertai kamu semua. Amin.');
    expect(last.isEndOfBible).toBe(true);
    expect(last.textAvailable).toBe(true);
  });
});

describe('AYT — textual authenticity', () => {
  it('matches sampled verses from every one of the 66 books byte-for-byte', () => {
    expect(golden.samples).toHaveLength(198);
    const booksSampled = new Set(golden.samples.map(s => s.bookId));
    expect(booksSampled.size).toBe(66);

    for (const sample of golden.samples) {
      const result = getVerse(sample.bookId, sample.chapter, sample.verse, 'AYT');
      expect(result.textAvailable, `${sample.bookId} ${sample.chapter}:${sample.verse} available`).toBe(true);
      expect(result.text, `${sample.bookId} ${sample.chapter}:${sample.verse}`).toBe(sample.text);
      expect(getAytVerseText(sample.bookId, sample.chapter, sample.verse)).toBe(sample.text);
    }
  });

  it('serves authentic text for all 31,102 AYT lookups — never generated or unavailable text', () => {
    let generated = 0;
    const unavailable: string[] = [];

    for (const book of BIBLE_BOOKS) {
      for (let chapter = 1; chapter <= book.totalChapters; chapter++) {
        for (let verse = 1; verse <= getVerseCount(book.id, chapter); verse++) {
          const result = getVerse(book.id, chapter, verse, 'AYT');
          const ref = `${book.id} ${chapter}:${verse}`;

          if (!result.textAvailable) unavailable.push(ref);
          if (result.text === UNAVAILABLE_TEXT_MESSAGE.AYT) unavailable.push(`${ref} (sentinel)`);
          for (const signature of GENERATED_TEXT_SIGNATURES) {
            if (result.text.includes(signature)) generated++;
          }
        }
      }
    }

    expect(unavailable).toEqual([]);
    expect(generated).toBe(0);
  });

  it('contains no leftover markup, placeholders or generator templates', () => {
    const problems: string[] = [];
    const patterns: Array<[string, RegExp]> = [
      ['unresolved tag', /<[^>]*>/],
      ['SFM marker', /\\[a-z]+\d?\*?/],
      ['placeholder token', /\b(lorem|ipsum|TODO|FIXME|XXX|PLACEHOLDER)\b/i],
      ['generator template', /(pasal \d+, ayat \d+|chapter \d+, verse \d+)/i],
      ['curly placeholder', /\{\{|\}\}|\[\[|\]\]/],
    ];

    for (const book of BIBLE_BOOKS) {
      for (let chapter = 1; chapter <= book.totalChapters; chapter++) {
        for (const verse of getChapterVerses(book.id, chapter, 'AYT')) {
          for (const [label, pattern] of patterns) {
            if (pattern.test(verse.text)) {
              problems.push(`${label} in ${book.id} ${chapter}:${verse.verseNumber}`);
            }
          }
        }
      }
    }

    expect(problems).toEqual([]);
  });

  it('preserves the publisher\'s annotation verses verbatim rather than rewriting them', () => {
    // Verse-bridge markers that AYT itself publishes for Isaiah's differing versification.
    expect(golden.bridgeMarkers.map(m => `${m.bookId} ${m.chapter}:${m.verse}`)).toEqual([
      'ISA 22:10',
      'ISA 22:11',
      'ISA 22:18',
    ]);
    for (const marker of golden.bridgeMarkers) {
      expect(getVerse(marker.bookId, marker.chapter, marker.verse, 'AYT').text).toBe(marker.text);
    }

    // Bracketed notes for passages absent from the earliest manuscripts.
    expect(golden.bracketedNotes).toHaveLength(8);
    for (const note of golden.bracketedNotes) {
      expect(getVerse(note.bookId, note.chapter, note.verse, 'AYT').text).toBe(note.text);
      expect(note.text.startsWith('[')).toBe(true);
    }
  });

  it('never fabricates filler to pad a chapter to its expected length', () => {
    // The removed generator repeated one template per chapter with only the verse number changing.
    // Legitimate scripture does repeat formulaic lines, but never as a whole chapter of clones.
    for (const book of BIBLE_BOOKS) {
      for (let chapter = 1; chapter <= book.totalChapters; chapter++) {
        const verses = getChapterVerses(book.id, chapter, 'AYT');
        expect(verses.length, `${book.id} ${chapter} length`).toBe(getVerseCount(book.id, chapter));

        const templates = verses.map(v => v.text.replace(/\d+/g, '#'));
        const templateSet = new Set(templates);
        const summarised = `${book.id} ${chapter}`;

        // A chapter may contain at most a handful of identical-templated verses, never a filler block.
        expect(templateSet.size, `${summarised} unique templates`).toBeGreaterThanOrEqual(
          Math.ceil(verses.length / 2)
        );
      }
    }
  });
});

describe('AYT — verse progression across the whole canon', () => {
  it('advances from Kejadian 1:1 to Wahyu 22:21 in exactly 31,102 authentic steps', () => {
    let bookId = 'GEN';
    let chapter = 1;
    let verse = 1;
    let steps = 0;
    const failures: string[] = [];

    for (;;) {
      const result = getVerse(bookId, chapter, verse, 'AYT');
      if (!result.textAvailable) failures.push(`${bookId} ${chapter}:${verse} has no AYT text`);
      steps++;

      const next = getNextVersePosition(bookId, chapter, verse);
      if (next.isEnd) {
        expect(`${bookId} ${chapter}:${verse}`).toBe('REV 22:21');
        break;
      }
      bookId = next.bookId;
      chapter = next.chapter;
      verse = next.verse;
      if (steps > 40000) throw new Error('progression did not terminate');
    }

    expect(failures).toEqual([]);
    expect(steps).toBe(31102);
  });

  it('walks backwards from Wahyu 22:21 to Kejadian 1:1 without gaps', () => {
    let bookId = 'REV';
    let chapter = 22;
    let verse = 21;
    let steps = 0;

    for (;;) {
      steps++;
      const prev = getPrevVersePosition(bookId, chapter, verse);
      if (prev.isStart) {
        expect(`${bookId} ${chapter}:${verse}`).toBe('GEN 1:1');
        break;
      }
      bookId = prev.bookId;
      chapter = prev.chapter;
      verse = prev.verse;
      if (steps > 40000) throw new Error('reverse progression did not terminate');
    }

    expect(steps).toBe(31102);
  });

  it('crosses every chapter and book boundary with authentic text on both sides', () => {
    const boundaries: Array<[string, number, number, string, number, number]> = [
      ['GEN', 1, 31, 'GEN', 2, 1],
      ['GEN', 50, 26, 'EXO', 1, 1],
      ['ISA', 21, 17, 'ISA', 22, 1],
      ['ISA', 22, 10, 'ISA', 22, 11],
      ['MAL', 4, 6, 'MAT', 1, 1],
      ['JUD', 1, 25, 'REV', 1, 1],
      ['REV', 22, 20, 'REV', 22, 21],
    ];

    for (const [fb, fc, fv, tb, tc, tv] of boundaries) {
      const next = getNextVersePosition(fb, fc, fv);
      expect(`${next.bookId} ${next.chapter}:${next.verse}`).toBe(`${tb} ${tc}:${tv}`);
      expect(getVerse(fb, fc, fv, 'AYT').textAvailable).toBe(true);
      expect(getVerse(tb, tc, tv, 'AYT').textAvailable).toBe(true);
    }
  });

  it('reports Isaiah 21 as 17 verses, matching the AYT data instead of the old metadata', () => {
    expect(getVerseCount('ISA', 21)).toBe(17);
    expect(getAytChapterVerseCounts('ISA')[20]).toBe(17);
    const last = getVerse('ISA', 21, 17, 'AYT');
    expect(last.textAvailable).toBe(true);
    expect(last.isLastVerseInChapter).toBe(true);
  });
});

describe('AYT — missing text is reported honestly, never invented', () => {
  it('returns the unavailable message and flags it for text the app does not have', () => {
    // WEB is intentionally a small authentic excerpt; most of it is not bundled.
    const result = getVerse('GEN', 20, 1, 'WEB');
    expect(result.textAvailable).toBe(false);
    expect(result.text).toBe(UNAVAILABLE_TEXT_MESSAGE.WEB);
    expect(result.reference).toBe('Genesis 20:1');
  });

  it('still reports an honest reference for a verse the bundled WEB excerpt omits', () => {
    const result = getVerse('REV', 22, 19, 'WEB');
    expect(result.textAvailable).toBe(false);
    expect(result.text).toBe(UNAVAILABLE_TEXT_MESSAGE.WEB);
    expect(result.reference).toBe('Revelation 22:19');

    // The verses WEB does bundle are still served normally.
    const bundled = getVerse('REV', 22, 21, 'WEB');
    expect(bundled.textAvailable).toBe(true);
    expect(bundled.text).toBe('The grace of the Lord Jesus Christ be with all the saints. Amen.');
  });

  it('honours an explicit verse range and only ever returns real verses', () => {
    const passage = getPassage('GEN', 1, 3, 5, 'AYT');
    expect(passage.reference).toBe('Kejadian 1:3-5');
    expect(passage.verses.map(v => v.verseNumber)).toEqual([3, 4, 5]);
    expect(passage.fullText).toBe(
      passage.verses.map(v => v.text).join(' ')
    );
    expect(passage.verses.every(v => v.text.trim().length > 0)).toBe(true);
    expect(passage.textAvailable).toBe(true);

    // An inverted or out-of-range request must not invent or drop verses silently.
    const inverted = getPassage('GEN', 1, 5, 3, 'AYT');
    expect(inverted.verses.map(v => v.verseNumber)).toEqual([5]);
    const beyond = getPassage('GEN', 1, 40, undefined, 'AYT');
    expect(beyond.verses.map(v => v.verseNumber)).toEqual([31]);
  });

  it('indexes verses by translation as well as book, chapter and verse', () => {
    // The same coordinates resolve to different, independently authentic texts per translation.
    const ayt = getVerse('SNG', 1, 1, 'AYT');
    const web = getVerse('SNG', 1, 1, 'WEB');
    expect(ayt.text).not.toBe(web.text);
    expect(ayt.translation).toBe('AYT');
    expect(web.translation).toBe('WEB');

    const aytChapter = getChapterVerses('SNG', 1, 'AYT');
    const webChapter = getChapterVerses('SNG', 1, 'WEB');
    expect(aytChapter).toHaveLength(17);
    expect(webChapter).toHaveLength(17);
    expect(aytChapter[0].text).toBe('Nyanyian di atas segala nyanyian dari Salomo.');
    expect(webChapter[0].text).toBe('The Song of songs, which is Solomon’s.');
  });

  it('never emits a fabricated passage for a chapter with no bundled text', () => {
    const passage = getPassage('GEN', 20, undefined, undefined, 'WEB');
    expect(passage.textAvailable).toBe(false);
    expect(passage.fullText).toBe('');
    expect(passage.verses).toEqual([]);

    const aytPassage = getPassage('GEN', 20, undefined, undefined, 'AYT');
    expect(aytPassage.textAvailable).toBe(true);
    expect(aytPassage.verses).toHaveLength(18);
    expect(aytPassage.reference).toBe('Kejadian 20');
  });

  it('returns nothing at all for a book or chapter it has no text for', () => {
    expect(getChapterVerses('XXX', 1, 'AYT')).toEqual([]);
    expect(getAytVerseText('GEN', 1, 32)).toBeNull();
    expect(getAytVerseText('GEN', 51, 1)).toBeNull();
    expect(getAytVerseText('NOPE', 1, 1)).toBeNull();
  });

  it('keeps the getVerse interface stable and additive', () => {
    const result = getVerse('JHN', 3, 16, 'AYT');
    expect(result).toMatchObject({
      bookId: 'JHN',
      chapter: 3,
      verse: 16,
      translation: 'AYT',
      totalVersesInChapter: 36,
      textAvailable: true,
    });
    expect(typeof result.text).toBe('string');
    expect(getBookById('JHN')?.nameId).toBe('Yohanes');
  });
});
