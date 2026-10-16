#!/usr/bin/env node
/**
 * Validates the downloaded AYT source and compiles it into the compact, verse-indexed
 * dataset the application ships with.
 *
 * Input  : .ayt-source/ayt.json   (run `npm run ayt:fetch` first)
 * Output : src/data/ayt/AYT.verses.json
 *
 * Output shape:
 *   { meta: {...}, books: { GEN: [ [ "verse 1", "verse 2", ... ], <chapter 2>, ... ], ... } }
 *
 * Books are keyed by the application's 3-letter ids in canonical Bible order. Chapter index i
 * holds chapter i+1; verse index j holds verse j+1. Because every verse number is validated to
 * be contiguous from 1, the array position IS the verse number — no generated or padded text.
 *
 * Usage: npm run ayt:build
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_FILE = path.resolve(process.cwd(), '.ayt-source/ayt.json');
const BIBLE_DATA_FILE = path.resolve(process.cwd(), 'src/data/bibleData.ts');
const OUT_FILE = path.resolve(process.cwd(), 'src/data/ayt/AYT.verses.json');
const GOLDEN_FILE = path.resolve(process.cwd(), 'src/data/ayt/AYT.golden.json');

/**
 * Verses the upstream AYT artifact carries as textual annotations rather than prose:
 * `(c:v)` verse-bridge markers and `[...]` notes for passages absent from the earliest manuscripts.
 * They are kept byte-for-byte verbatim — the app must return the exact published string — and are
 * recorded in the golden file so the validation suite notices if they ever change.
 */
const ANNOTATION_BRIDGE = /^\(\s*\d+[:.]\d+\s*\)$/;
const ANNOTATION_BRACKETED = /^\[.*\]$/;

/** Verse markers that appear in the upstream text and are not part of the scripture wording. */
const UPSTREAM_MARKUP = /<t \/>/g;

/** The standard Protestant versification total. A strong independent completeness check. */
const CANONICAL_VERSE_TOTAL = 31102;
const EXPECTED_BOOK_COUNT = 66;

/** Reads the ordered list of book ids from the application's bible metadata. */
async function readBookIds() {
  const src = await readFile(BIBLE_DATA_FILE, 'utf8');
  const ids = [...src.matchAll(/\{\s*id:\s*'([A-Z0-9]{3})',\s*nameEn:/g)].map(m => m[1]);
  if (ids.length !== EXPECTED_BOOK_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_BOOK_COUNT} book ids in bibleData.ts but found ${ids.length}.`
    );
  }
  return ids;
}

function fail(message) {
  throw new Error(`AYT build rejected: ${message}`);
}

async function main() {
  let raw;
  try {
    raw = await readFile(SOURCE_FILE, 'utf8');
  } catch {
    throw new Error(
      `Missing ${SOURCE_FILE}. Run \`npm run ayt:fetch\` to download and verify the source first.`
    );
  }

  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) fail('source is not an array of verse rows');
  if (rows.length !== CANONICAL_VERSE_TOTAL) {
    fail(`source has ${rows.length} verse rows, expected ${CANONICAL_VERSE_TOTAL}`);
  }

  const bookIds = await readBookIds();

  // Group into book order -> chapter -> verse, validating as we go.
  /** @type {Map<number, Map<number, Map<number, string>>>} */
  const byBook = new Map();
  const seen = new Set();
  const problems = [];

  for (const row of rows) {
    const bookOrder = Number(row.book);
    const chapter = Number(row.chapter);
    const verse = Number(row.verse);

    if (!Number.isInteger(bookOrder) || bookOrder < 1 || bookOrder > EXPECTED_BOOK_COUNT) {
      problems.push(`invalid book number: ${JSON.stringify(row.book)}`);
      continue;
    }
    if (!Number.isInteger(chapter) || chapter < 1) {
      problems.push(`${bookOrder}: invalid chapter ${JSON.stringify(row.chapter)}`);
      continue;
    }
    if (!Number.isInteger(verse) || verse < 1) {
      problems.push(`${bookOrder} ${chapter}: invalid verse ${JSON.stringify(row.verse)}`);
      continue;
    }

    const id = `${bookOrder}|${chapter}|${verse}`;
    if (seen.has(id)) {
      problems.push(`duplicate verse id ${id}`);
      continue;
    }
    seen.add(id);

    const text = String(row.text ?? '').replace(UPSTREAM_MARKUP, '').trim();
    if (!text) {
      problems.push(`empty text for ${id}`);
      continue;
    }
    if (/<[^>]*>/.test(text) || /\\[a-z]+\d?\*?/.test(text)) {
      problems.push(`unresolved markup in ${id}: ${JSON.stringify(text.slice(0, 60))}`);
      continue;
    }

    if (!byBook.has(bookOrder)) byBook.set(bookOrder, new Map());
    const chapters = byBook.get(bookOrder);
    if (!chapters.has(chapter)) chapters.set(chapter, new Map());
    chapters.get(chapter).set(verse, text);
  }

  if (problems.length) {
    fail(`${problems.length} problem(s):\n  - ${problems.slice(0, 20).join('\n  - ')}`);
  }

  // Build the compact structure, enforcing contiguity so array position == verse number.
  const books = {};
  let verseTotal = 0;
  const perBook = {};

  for (let order = 1; order <= EXPECTED_BOOK_COUNT; order++) {
    const chapters = byBook.get(order);
    if (!chapters) fail(`book #${order} (${bookIds[order - 1]}) is missing entirely`);

    const chapterNumbers = [...chapters.keys()].sort((a, b) => a - b);
    if (chapterNumbers[0] !== 1 || chapterNumbers[chapterNumbers.length - 1] !== chapterNumbers.length) {
      fail(`book #${order} (${bookIds[order - 1]}) chapters are not contiguous from 1: ${chapterNumbers.join(',')}`);
    }

    const bookChapters = [];
    let bookVerses = 0;

    for (const chapterNumber of chapterNumbers) {
      const verses = chapters.get(chapterNumber);
      const verseNumbers = [...verses.keys()].sort((a, b) => a - b);
      if (verseNumbers[0] !== 1 || verseNumbers[verseNumbers.length - 1] !== verseNumbers.length) {
        fail(
          `${bookIds[order - 1]} ${chapterNumber} verses are not contiguous from 1: ${verseNumbers.join(',')}`
        );
      }
      bookChapters.push(verseNumbers.map(v => verses.get(v)));
      bookVerses += verseNumbers.length;
    }

    books[bookIds[order - 1]] = bookChapters;
    perBook[bookIds[order - 1]] = { chapters: bookChapters.length, verses: bookVerses };
    verseTotal += bookVerses;
  }

  if (verseTotal !== CANONICAL_VERSE_TOTAL) {
    fail(`compiled ${verseTotal} verses, expected ${CANONICAL_VERSE_TOTAL}`);
  }

  // Verses whose published text is a textual annotation rather than prose.
  const bridgeMarkers = [];
  const bracketedNotes = [];
  for (let order = 1; order <= EXPECTED_BOOK_COUNT; order++) {
    const id = bookIds[order - 1];
    books[id].forEach((verses, chapterIndex) => {
      verses.forEach((text, verseIndex) => {
        const ref = { bookId: id, chapter: chapterIndex + 1, verse: verseIndex + 1, text };
        if (ANNOTATION_BRIDGE.test(text.trim())) bridgeMarkers.push(ref);
        else if (ANNOTATION_BRACKETED.test(text.trim())) bracketedNotes.push(ref);
      });
    });
  }

  const sourceChecksum = createHash('sha256').update(raw).digest('hex');
  const datasetChecksum = createHash('sha256').update(JSON.stringify(books)).digest('hex');
  const payload = {
    meta: {
      translation: 'AYT',
      translationName: 'Alkitab Yang Terbuka',
      copyrightHolder: 'Yayasan Lembaga SABDA (YLSA)',
      copyright: '© 2011-2024 YLSA-AYT',
      license: 'AYT usage (non-commercial) is CopyLefted — free usage/distribution of the text is permitted; derivatives are CC BY-NC-SA. Permissions are managed by YLSA (https://ayt.co).',
      sourceUrl: 'https://github.com/sabdacode/ayt',
      sourceArtifact: 'json/ayt.json',
      sourceCommit: 'd741613e179e1ce088a83e120ea76846d0fba481',
      sourceChecksum,
      bookCount: EXPECTED_BOOK_COUNT,
      verseCount: verseTotal,
      canonicalVerseTotal: CANONICAL_VERSE_TOTAL,
      datasetChecksum,
    },
    books,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  const serialized = JSON.stringify(payload);
  await writeFile(OUT_FILE, serialized);

  // Golden samples: 3 verses per book (first, middle, last) plus every annotation verse, so the
  // offline validation suite can re-check real text from all 66 books without the 9.9 MiB source.
  const samples = [];
  for (let order = 1; order <= EXPECTED_BOOK_COUNT; order++) {
    const id = bookIds[order - 1];
    const chapters = books[id];
    const picks = [
      [1, 1],
      [Math.ceil(chapters.length / 2), Math.ceil(chapters[Math.ceil(chapters.length / 2) - 1].length / 2)],
      [chapters.length, chapters[chapters.length - 1].length],
    ];
    for (const [chapter, verse] of picks) {
      samples.push({ bookId: id, chapter, verse, text: chapters[chapter - 1][verse - 1] });
    }
  }

  const golden = {
    sourceChecksum,
    sourceCommit: 'd741613e179e1ce088a83e120ea76846d0fba481',
    datasetChecksum,
    bookTotal: EXPECTED_BOOK_COUNT,
    verseTotal,
    canonicalVerseTotal: CANONICAL_VERSE_TOTAL,
    samples,
    bridgeMarkers,
    bracketedNotes,
  };
  await writeFile(GOLDEN_FILE, JSON.stringify(golden, null, 2));

  console.log('ayt:build — validation passed');
  console.log(`            books           : ${Object.keys(books).length}`);
  console.log(`            verses          : ${verseTotal}`);
  console.log(`            source sha256   : ${sourceChecksum}`);
  console.log(`            output          : ${OUT_FILE}`);
  console.log(`            output size     : ${(serialized.length / 1024 / 1024).toFixed(2)} MiB`);
  console.log(`            dataset sha256  : ${datasetChecksum}`);
  console.log(`            golden samples  : ${samples.length} (3 per book)`);
  console.log(`            bridge markers  : ${bridgeMarkers.map(r => `${r.bookId} ${r.chapter}:${r.verse}`).join(', ')}`);
  console.log(`            bracketed notes : ${bracketedNotes.length}`);
  console.log(`            golden output   : ${GOLDEN_FILE}`);
  console.log('');
  console.log('Verse totals per book:');
  for (const [id, stats] of Object.entries(perBook)) {
    console.log(`  ${id.padEnd(4)} ch=${String(stats.chapters).padStart(3)}  v=${String(stats.verses).padStart(4)}`);
  }
}

main().catch(err => {
  console.error(`ayt:build — ${err.message}`);
  process.exit(1);
});
