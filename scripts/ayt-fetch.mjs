#!/usr/bin/env node
/**
 * Downloads the upstream Alkitab Yang Terbuka (AYT) dataset and verifies its integrity.
 *
 * Provenance
 *   Upstream : https://github.com/sabdacode/ayt  (Yayasan Lembaga SABDA / YLSA, the AYT publisher)
 *   Artifact : json/ayt.json at commit d741613e179e1ce088a83e120ea76846d0fba481 (2024-02-07)
 *   License  : see src/data/ayt/AYT.LICENSE.html
 *              "AYT - usage (non-commercial) is CopyLefted, 2011 -- this is to allow
 *               free usage/distribution of the text"
 *
 * The commit SHA is pinned so the byte content is immutable; the SHA-256 check fails loudly
 * if the upstream artifact ever changes.
 *
 * Usage: npm run ayt:fetch
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const UPSTREAM_COMMIT = 'd741613e179e1ce088a83e120ea76846d0fba481';
const UPSTREAM_PATH = 'json/ayt.json';
const UPSTREAM_URL = `https://raw.githubusercontent.com/sabdacode/ayt/${UPSTREAM_COMMIT}/${UPSTREAM_PATH}`;
const EXPECTED_SHA256 = 'fc1c9ab022fa77af17250d900bf0c175bb3d32870658af231fca7498a99112e5';

const OUT_DIR = path.resolve(process.cwd(), '.ayt-source');
const OUT_FILE = path.join(OUT_DIR, 'ayt.json');

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (existsSync(OUT_FILE)) {
    const existing = await import('node:fs/promises').then(m => m.readFile(OUT_FILE));
    if (sha256(existing) === EXPECTED_SHA256) {
      console.log(`ayt:fetch — cached source already matches pin (${EXPECTED_SHA256.slice(0, 12)}…)`);
      console.log(`              ${OUT_FILE}`);
      return;
    }
    console.log('ayt:fetch — cached source does not match the pin, re-downloading');
  }

  console.log(`ayt:fetch — downloading ${UPSTREAM_URL}`);
  const res = await fetch(UPSTREAM_URL);
  if (!res.ok) {
    throw new Error(`Download failed: HTTP ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const actual = sha256(buf);

  if (actual !== EXPECTED_SHA256) {
    throw new Error(
      `Integrity check FAILED for ${UPSTREAM_URL}\n` +
        `  expected sha256 ${EXPECTED_SHA256}\n` +
        `  actual   sha256 ${actual}\n` +
        'Refusing to write an unverified scripture source.'
    );
  }

  await writeFile(OUT_FILE, buf);
  console.log(`ayt:fetch — OK, sha256 verified (${buf.length} bytes)`);
  console.log(`              ${OUT_FILE}`);
}

main().catch(err => {
  console.error(`ayt:fetch — ${err.message}`);
  process.exit(1);
});
