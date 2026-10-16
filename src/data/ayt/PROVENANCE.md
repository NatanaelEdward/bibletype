# AYT scripture data — provenance, licensing and verification

This directory holds the **authentic** Alkitab Yang Terbuka (AYT) text that the application
displays for the Indonesian translation. Nothing in it is generated, paraphrased or padded.

## 1. What AYT is, and who owns it

**Alkitab Yang Terbuka (AYT)** is an Indonesian Bible translation made and published by
**Yayasan Lembaga SABDA (YLSA)**.

- AYT official site: <https://ayt.co>
- Publisher: <https://ylsa.org>
- Copyright notice (SABDA): <https://copyright.sabda.org/content.php> — *"COPYRIGHT © 2018
  Yayasan Lembaga SABDA (YLSA)"*

AYT is **not** public domain, and it is **not** published by Yayasan Lentera Bangsa (that
foundation is credited with the separate ILT/MILT text).

## 2. The exact artifact this build was compiled from

| Field | Value |
| --- | --- |
| Upstream repository | <https://github.com/sabdacode/ayt> (the publisher's own dataset repo) |
| Artifact | `json/ayt.json` |
| Pinned commit | `d741613e179e1ce088a83e120ea76846d0fba481` (2024-02-07) |
| Download URL | <https://raw.githubusercontent.com/sabdacode/ayt/d741613e179e1ce088a83e120ea76846d0fba481/json/ayt.json> |
| Size / rows | 9,913,651 bytes / 31,102 verse rows |
| SHA-256 | `fc1c9ab022fa77af17250d900bf0c175bb3d32870658af231fca7498a99112e5` |
| Retrieved | 2026-10-17 |
| Compiled dataset SHA-256 | `f61ba22ba748dcbf5b6b11da7ad768cfb13f473933493813440bcf9bac1ca9f4` |

The commit SHA is pinned rather than tracking `main`, so the artifact bytes are immutable. The
SHA-256 is asserted in `scripts/ayt-fetch.mjs`; a changed upstream artifact fails the fetch
loudly instead of silently shipping different scripture.

## 3. License terms — verbatim

From the publisher's own `LICENSE.html` (mirrored here as [`AYT.LICENSE.html`](./AYT.LICENSE.html)):

> AYT is Alkitab Yang Terbuka, PB (2010,..-2024) and PL (2014,...2024).
>
> AYT - text is Copyrighted, YLSA-AYT 2011,2024© -- this is to preserve and protect the quality of
> the Text. Suggestions, Comments, Changes, Corrections are encouraged, and can be submitted to
> YLSA-AYT.
>
> AYT - usage (non-commercial) is CopyLefted, 2011🄯 -- this is to allow free usage/distribution of
> the text
>
> AYT - derivatives (form, format, media, tools, resources) is CC, YLSA-AYT 2011(cc) -- we
> encourage you to use the AYT in creative ways, and to share the results. Creative Commons(CC)
> type is Credit(BY), Non-Commercial(NC), Shareable(SA)
>
> AYT - translation license is freely given, 2011-2024 -- information and/or reporting is
> appreciated, but not required.
>
> AYT permissions are managed by YLSA.
>
> AYT (and Alkitab Yang Terbuka) name are Trademarks associated with the AYT Bible, and AYT
> ecosystem/tools.

### What that means for this application

- **Permitted here:** bundling and redistributing the AYT text for **non-commercial** use with
  attribution. This project (`bibletype`, `"private": true`) is a personal, non-commercial
  scripture-typing application — no sales, ads, subscriptions or paid access — which is the use
  the grant above explicitly allows.
- **Attribution is required and is preserved:** the copyright holder, the copyright years and the
  licence are recorded in the generated data (`meta` in `AYT.verses.json`), shown in the
  application's Settings panel, and reproduced in this file with the upstream licence text.
- **Derivatives are CC BY-NC-SA**, so if this app is ever published in modified form it must keep
  the same non-commercial, share-alike terms.
- **Commercial use would require permission from YLSA** (<https://ayt.co>, ylsa@sabda.org).
- **The AYT and "Alkitab Yang Terbuka" names are trademarks.**

### Known licence inconsistency (reported, not resolved)

Hosts disagree on the exact licence name. eBible.org's entry for the same translation
(<https://ebible.org/details.php?id=indayt>) says:

> This translation is made available to you under the terms of the Creative Commons
> Attribution-No Derivatives license 4.0. You may share, redistribute, or adapt this Bible
> translation or extracts from it in any format, provided that: You include the above copyright
> and source information. You do not use this work for commercial purposes. …

That names **BY-ND 4.0** while also permitting adaptation and imposing non-commercial use, which
does not match the publisher's own **BY-NC-SA** description of derivatives. The Door43 catalog
copy declares `Free Translate 2.0 International Public License`. Every source agrees on the two
points that matter here: **attribution is required** and **use must be non-commercial**. This
project relies only on those two, and does not modify the scripture text.

## 4. What the app does with the text

- `scripts/ayt-build.mjs` validates the source (66 books; chapters and verses contiguous from 1;
  no duplicate verse ids; no empty text; no unresolved markup), then compiles it into
  `AYT.verses.json` keyed by book → chapter → verse.
- Verse numbers are validated contiguous from 1, so the array position *is* the verse number and
  every lookup returns the exact published string.
- The data is imported as raw text and parsed once at startup, which keeps `getVerse()` synchronous.
- The `<t />` paragraph marker used in the upstream SFM-derived JSON is stripped; it is layout
  metadata, not scripture wording. No other character of any verse is altered.

### Verse text that is annotation rather than prose

AYT itself publishes 11 verses whose text is a textual annotation. They are kept byte-for-byte and
pinned in `AYT.golden.json`:

- **Verse-bridge markers** — `ISA 22:10` and `ISA 22:11` contain `(22:9)`, and `ISA 22:18` contains
  `(22:17)`. AYT keeps Masoretic verse numbering, so these point to the verse that carries the
  wording for this passage.
- **Bracketed notes (8)** — `MAT 17:21`, `MAT 18:11`, `LUK 17:36`, `LUK 23:17`, `LUK 23:19`,
  `ACT 8:37`, `ACT 15:34`, `ACT 28:29`. The square brackets are AYT's notation for passages absent
  from the earliest manuscripts.

These are the publisher's own strings. They were not removed, reworded or hidden.

### Legitimate repeated text

97 verses share their exact wording with at least one other verse — for example
`TUHAN berfirman kepada Musa,` (49 occurrences) and sacrificial formulas in Bilangan 7 and 29.
This repetition is genuine scripture, so no de-duplication is applied.

## 5. Regenerating and verifying

```sh
npm run ayt:fetch    # download the pinned artifact and verify its SHA-256 (.ayt-source/, gitignored)
npm run ayt:build    # validate + recompile src/data/ayt/AYT.verses.json and AYT.golden.json
npm run ayt:verify   # compare ALL 31,102 shipped verses byte-for-byte against the original source
npm run ayt:coverage # write reports/ayt-coverage.md (per-book and per-chapter coverage)
npm test             # offline suite: coverage, duplicates, placeholders, golden samples, progression
```

`ayt:verify` needs `.ayt-source/ayt.json`; the vitest suite does not (it uses the recorded golden
samples and dataset checksum), so CI stays network-free.

## 6. Files

| File | Role |
| --- | --- |
| `AYT.verses.json` | Compiled, verse-indexed AYT text shipped with the app (4.4 MiB) |
| `AYT.golden.json` | 198 recorded samples (3 per book), annotation verses, and checksums |
| `AYT.LICENSE.html` | Verbatim upstream licence/copyright notice |
| `PROVENANCE.md` | This document |
| `aytScripture.ts` | Access layer; returns exact text or `null`, never a substitute |
