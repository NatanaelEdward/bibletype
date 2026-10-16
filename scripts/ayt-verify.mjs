#!/usr/bin/env node
/**
 * Independent verification of the shipped AYT text against the original upstream artifact.
 *
 * Unlike the vitest suite (which is offline and works from recorded golden samples), this script
 * compares ALL 31,102 verses byte-for-byte against the publisher's own `ayt.json`, and fails if
 * any verse is missing, extra, or textually different.
 *
 * Usage: npm run ayt:fetch && npm run ayt:verify
 */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_FILE = path.resolve(process.cwd(), '.ayt-source/ayt.json');
const SHIPPED_FILE = path.resolve(process.cwd(), 'src/data/ayt/AYT.verses.json');
const PINNED_SOURCE_SHA256 = 'fc1c9ab022fa77af17250d900bf0c175bb3d32870658af231fca7498a99112e5';

/** Signatures of the procedural scripture generator that was removed from the app. */
const GENERATED_TEXT_SIGNATURES = [
  'Firman TUHAN berkenaan dengan',
  'The word of the LORD came regarding',
  'The word of the LORD in ',
  'Firman TUHAN dalam ',
];

function fail(message) {
  console.error(`ayt:verify — FAIL: ${message}`);
  process.exit(1);
}

async function main() {
  let raw;
  try {
    raw = await readFile(SOURCE_FILE, 'utf8');
  } catch {
    fail(
      `the original source ${SOURCE_FILE} is not present.\n` +
        '  Run `npm run ayt:fetch` (which verifies the pinned SHA-256) and then re-run this script.'
    );
  }

  const actualSourceHash = createHash('sha256').update(raw).digest('hex');
  if (actualSourceHash !== PINNED_SOURCE_SHA256) {
    fail(
      `local source does not match the pinned upstream artifact.\n` +
        `  expected ${PINNED_SOURCE_SHA256}\n  actual   ${actualSourceHash}`
    );
  }
  console.log(`ayt:verify — source artifact verified (sha256 ${actualSourceHash})`);

  const rows = JSON.parse(raw);
  const shipped = JSON.parse(await readFile(SHIPPED_FILE, 'utf8'));

  if (shipped.meta?.sourceChecksum !== PINNED_SOURCE_SHA256) {
    fail('the shipped dataset does not record the pinned source checksum.');
  }

  // Rebuild the expected text index straight from the publisher's artifact.
  const expected = new Map();
  for (const row of rows) {
    const key = `${Number(row.book)}|${Number(row.chapter)}|${Number(row.verse)}`;
    if (expected.has(key)) fail(`source artifact contains a duplicate verse id ${key}`);
    expected.set(key, String(row.text ?? '').replace(/<t \/>/g, '').trim());
  }

  const bookIds = Object.keys(shipped.books);
  if (bookIds.length !== 66) fail(`shipped dataset has ${bookIds.length} books, expected 66`);

  const mismatches = [];
  const missing = [];
  const extra = [];
  const flattened = new Map();

  bookIds.forEach((bookId, bookIndex) => {
    shipped.books[bookId].forEach((verses, chapterIndex) => {
      verses.forEach((text, verseIndex) => {
        const key = `${bookIndex + 1}|${chapterIndex + 1}|${verseIndex + 1}`;
        flattened.set(key, text);
      });
    });
  });

  let compared = 0;
  for (const [key, sourceText] of expected) {
    if (!flattened.has(key)) {
      missing.push(key);
      continue;
    }
    compared++;
    const shippedText = flattened.get(key);
    if (shippedText !== sourceText) {
      mismatches.push({ key, expected: sourceText, actual: shippedText });
    }
  }
  for (const key of flattened.keys()) {
    if (!expected.has(key)) extra.push(key);
  }

  // No shipped verse may carry wording only the deleted generator produced.
  const generated = [];
  for (const [key, text] of flattened) {
    for (const signature of GENERATED_TEXT_SIGNATURES) {
      if (text.includes(signature)) generated.push({ key, signature, text });
    }
  }

  const report = [];
  if (missing.length) report.push(`${missing.length} expected verse(s) missing, e.g. ${missing.slice(0, 5).join(', ')}`);
  if (extra.length) report.push(`${extra.length} unexpected verse id(s), e.g. ${extra.slice(0, 5).join(', ')}`);
  if (mismatches.length) {
    report.push(`${mismatches.length} text mismatch(es):`);
    for (const m of mismatches.slice(0, 20)) {
      report.push(`    ${m.key}`);
      report.push(`      source: ${JSON.stringify(m.expected.slice(0, 120))}`);
      report.push(`      shipped: ${JSON.stringify(m.actual.slice(0, 120))}`);
    }
  }
  if (generated.length) {
    report.push(`${generated.length} verse(s) still contain generated-text signatures:`);
    for (const g of generated.slice(0, 5)) report.push(`    ${g.key} <- "${g.signature}"`);
  }

  if (report.length) fail(report.join('\n'));

  console.log(`ayt:verify — PASS`);
  console.log(`            source verses        : ${expected.size}`);
  console.log(`            shipped verses       : ${flattened.size}`);
  console.log(`            byte-exact matches   : ${compared}`);
  console.log(`            mismatches           : 0`);
  console.log(`            missing / extra      : 0 / 0`);
  console.log(`            generated-text hits  : 0`);
}

main().catch(err => fail(err.message));
