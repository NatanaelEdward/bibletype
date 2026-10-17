# Bible Typing Indonesia — Minimalist Scripture Typing

Want to practice your typing while reading the Bible? Say no more. Bible Typing Indonesia is here for you.

A focused, keyboard-first typing app for the Indonesian **Alkitab Yang Terbuka (AYT)** translation. All 66 books and 31,102 verses are bundled with the app and verified byte-for-byte against the published source.

## Features

### Three practice modes

- **Ayat Pilihan** — choose any book, chapter, and verse, then type it. Saving the verse moves you on to the next one.
- **Per Kitab** — work through an entire book, verse by verse, with accurate progress for that book. A completion panel appears at the last verse so you can pick another book or continue to the next one in canon order.
- **Lanjutkan** — resume from where you stopped. Your last saved position is restored from local storage; if nothing has been saved yet, you can start at Genesis 1:1 or choose a verse.

### Typing experience

- Character-by-character feedback with a caret that follows you through long chapters.
- Text wraps by whole words, so a word is never split at the end of a line.
- Punctuation equivalence — a straight `"` matches `“` and `”`, `'` matches `‘` and `’`, and `-` matches `—`.
- Live gross WPM, net WPM, and accuracy, with running totals across multi-verse runs.
- Monkeytype-style session accuracy: a mistake that is later corrected stays counted for the session.
- Verse text is never generated, paraphrased, or padded. If a passage is not bundled, the app says so and blocks typing.

### Settings

Everything is adjusted from the Settings dialog:

- **Lanjut Otomatis** — after a verse is completed, continue immediately or show a short results summary.
- **Gaya Kursor** — line, block, or underline caret.
- **Ukuran Huruf** — small, medium, large, or extra large text.
- **Suara Ketikan** — mechanical key sounds generated with the Web Audio API (no audio files).
- **Kurangi Motion** — reduce animations for a calmer session.
- **Smooth Scroll** — smoother transitions when moving between verses.
- **Abaikan Huruf Besar/Kecil** — ignore letter case while typing.
- **Reset progres** — clear statistics and progress after a confirmation step.

### Saved verses and progress

- Every completed verse is saved locally with its reference, text, WPM, and accuracy.
- The saved-verses panel supports search, editing a saved text, and jumping back to any verse.
- Personal bests, the last 50 sessions, and per-passage completion counts are tracked in the progress panel.
- An interrupted **Per Kitab** or **Lanjutkan** run can be resumed after a refresh.
- Everything is stored in your browser. There is no account and no server.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Tab` | Restart the current verse |
| `Esc` | Pause or resume |
| `Ctrl` + `Backspace` | Delete the previous word |
| `Enter` | Continue to the next verse (results summary) |

## Scripture coverage

| Translation | Coverage |
| --- | --- |
| **AYT** (Alkitab Yang Terbuka) | Complete: all 66 books, 31,102 verses, Genesis 1:1 through Revelation 22:21 |

Only the Indonesian AYT text is bundled, so the app does not show an English translation.

Source provenance, the pinned upstream commit, the SHA-256 checksums, and the licensing terms are recorded in [`src/data/ayt/PROVENANCE.md`](src/data/ayt/PROVENANCE.md).

## Tech stack

- React 19 and TypeScript
- Vite
- Tailwind CSS v4
- Lucide icons
- Vitest and React Testing Library
- LocalStorage for persistence, using a versioned schema
- Web Audio API for key sounds

## Getting started

You will need Node.js and npm.

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

```bash
npm test          # run the test suite
npm run build     # type-check and build for production
```

### AYT data pipeline

The bundled dataset can be rebuilt and checked from scratch:

```bash
npm run ayt:fetch     # download the pinned upstream artifact and verify its SHA-256
npm run ayt:build     # validate and rebuild the verse-indexed dataset
npm run ayt:verify    # compare all 31,102 shipped verses byte-for-byte with the source
npm run ayt:coverage  # write a per-book and per-chapter coverage report
```

## Licensing and attribution

**Alkitab Yang Terbuka (AYT)** — © 2011–2024 Yayasan Lembaga SABDA (YLSA) / [ayt.co](https://ayt.co). The text is used non-commercially under YLSA's grant: *"AYT - usage (non-commercial) is CopyLefted, 2011 — this is to allow free usage/distribution of the text"*, with derivative works under CC BY-NC-SA. Permissions are managed by YLSA (ylsa@sabda.org). The notice is reproduced in the app footer and in the bundled data.

Third-party libraries, icons, and typefaces (React, Vite, Tailwind CSS, Lucide, Inter, JetBrains Mono, and others) remain the property of their authors and under their respective licences. The AYT text is covered only by the terms above. No licence file for this project's own source code is included in the repository.

---

Created by NatanaelE.
