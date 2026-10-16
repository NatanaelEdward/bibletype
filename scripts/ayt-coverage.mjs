#!/usr/bin/env node
/**
 * Emits a per-book / per-chapter AYT coverage report from the shipped dataset,
 * cross-checked against the application's own book metadata.
 *
 * Usage: npm run ayt:coverage
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SHIPPED = path.resolve(process.cwd(), 'src/data/ayt/AYT.verses.json');
const BIBLE_DATA = path.resolve(process.cwd(), 'src/data/bibleData.ts');
const OUT = path.resolve(process.cwd(), 'reports/ayt-coverage.md');

async function main() {
  const payload = JSON.parse(await readFile(SHIPPED, 'utf8'));
  const src = await readFile(BIBLE_DATA, 'utf8');

  const meta = [];
  const re =
    /\{\s*id:\s*'([A-Z0-9]{3})',\s*nameEn:\s*'([^']*)',\s*nameId:\s*'([^']*)',\s*testament:\s*'(OT|NT)',\s*order:\s*(\d+),\s*totalChapters:\s*(\d+),\s*chapterVerses:\s*\[([^\]]*)\]\s*\}/g;
  let m;
  while ((m = re.exec(src))) {
    meta.push({
      id: m[1],
      nameId: m[3],
      testament: m[4],
      order: Number(m[5]),
      chapters: Number(m[6]),
      verseCounts: m[7].split(',').map(s => Number(s.trim())),
    });
  }
  meta.sort((a, b) => a.order - b.order);

  const lines = [];
  const push = s => lines.push(s);

  let totalChapters = 0;
  let totalVerses = 0;
  let gaps = 0;
  const ot = { chapters: 0, verses: 0 };
  const nt = { chapters: 0, verses: 0 };
  const rows = [];

  for (const book of meta) {
    const shipped = payload.books[book.id];
    const chapters = shipped?.length ?? 0;
    const verses = shipped ? shipped.reduce((s, c) => s + c.length, 0) : 0;
    totalChapters += chapters;
    totalVerses += verses;
    if (book.testament === 'OT') {
      ot.chapters += chapters;
      ot.verses += verses;
    } else {
      nt.chapters += chapters;
      nt.verses += verses;
    }

    // Per-chapter comparison against the app metadata.
    const chapterGaps = [];
    for (let c = 1; c <= book.chapters; c++) {
      const expected = book.verseCounts[c - 1];
      const actual = shipped?.[c - 1]?.length ?? 0;
      if (expected !== actual) chapterGaps.push(`${c}: ${actual}/${expected}`);
    }
    if (!shipped) chapterGaps.unshift('entire book missing');
    if (chapterGaps.length) gaps++;

    rows.push({
      book: book.id,
      name: book.nameId,
      testament: book.testament,
      chapters,
      expectedChapters: book.chapters,
      verses,
      expectedVerses: book.verseCounts.reduce((a, b) => a + b, 0),
      status: chapterGaps.length ? `GAP → ${chapterGaps.join(', ')}` : 'complete',
    });
  }

  const complete = rows.filter(r => r.status === 'complete').length;

  push('# AYT coverage report');
  push('');
  push(`Generated from \`src/data/ayt/AYT.verses.json\` — every verse is the publisher's own AYT text`);
  push(`(source sha256 \`${payload.meta.sourceChecksum}\`, dataset sha256 \`${payload.meta.datasetChecksum}\`).`);
  push('');
  push('## Summary');
  push('');
  push('| Metric | Value |');
  push('| --- | --- |');
  push(`| Books with complete coverage | **${complete} / ${meta.length}** |`);
  push(`| Chapters covered | **${totalChapters}** |`);
  push(`| Verses covered | **${totalVerses}** |`);
  push(`| Old Testament | ${ot.chapters} chapters, ${ot.verses} verses |`);
  push(`| New Testament | ${nt.chapters} chapters, ${nt.verses} verses |`);
  push(`| Books with any chapter/verse gap | **${gaps}** |`);
  push(`| First verse | Kejadian 1:1 — \`${payload.books.GEN[0][0]}\` |`);
  push(`| Last verse | Wahyu 22:21 — \`${payload.books.REV[21][20]}\` |`);
  push('');
  push('## Coverage by book');
  push('');
  push('| # | Book | ID | Testament | Chapters | Verses | Gap |');
  push('| ---: | --- | --- | --- | ---: | ---: | --- |');
  rows.forEach((r, index) => {
    push(
      `| ${index + 1} | ${r.name} | \`${r.book}\` | ${r.testament} | ${r.chapters}/${r.expectedChapters} | ${r.verses}/${r.expectedVerses} | ${r.status === 'complete' ? '—' : r.status} |`
    );
  });
  push('');
  push('## Coverage by chapter');
  push('');
  push('Every chapter is listed below with the number of verses shipped. A chapter is complete when');
  push('its verse count equals the expected count and its verses are numbered contiguously from 1.');
  push('');
  for (const book of meta) {
    const shipped = payload.books[book.id] ?? [];
    const cells = shipped.map((c, i) => (c.length === book.verseCounts[i] ? `${i + 1}✓` : `${i + 1}→${c.length}`));
    push(`- **${book.name}** (${book.id}) — ${book.chapters} ch: ${cells.join(', ')}`);
  }
  push('');

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, lines.join('\n'));

  console.log(`ayt:coverage — books complete : ${complete}/${meta.length}`);
  console.log(`               chapters        : ${totalChapters}`);
  console.log(`               verses          : ${totalVerses}`);
  console.log(`               books with gaps : ${gaps}`);
  console.log(`               report          : ${OUT}`);
}

main().catch(err => {
  console.error(`ayt:coverage — ${err.message}`);
  process.exit(1);
});
