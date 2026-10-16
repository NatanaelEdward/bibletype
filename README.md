# BibleType — Minimalist Scripture Typing

A keyboard-first, distraction-free typing application inspired by Monkeytype, crafted for typing Holy Scripture in **English (World English Bible - WEB)** and **Indonesian (Alkitab Yang Terbuka - AYT)**.

## ✨ Features

- **Three Practice Modes**:
  - **Single Passage / Chapter Mode**: Practice any individual chapter or verse slice.
  - **Book Mode**: Progress sequentially through chapters of a book with auto-continue.
  - **Continuous Mode ("Continue to the End")**: Pick any starting verse; Unit 1 types from that verse to the end of the chapter, then flows chapter-by-chapter and book-by-book all the way to Revelation 22.
- **Auto-Continue Behavior**:
  - **Immediate (Default)**: Loads and starts the next sequential unit instantly upon completion with zero friction.
  - **Summary**: Displays a compact results modal with a short countdown and Continue button.
- **Typing Engine**:
  - Character-level feedback (muted untyped, crisp off-white correct, red error highlight).
  - Typographic keyboard equivalence (straight quotes `'` and `"` match curly `‘ ’` and `“ ”`; hyphens match em-dashes `—`).
  - Full Backspace and Word Backspace (`Ctrl + Backspace`) without session corruption.
  - Windowed scrolling viewport that follows the caret smoothly for long chapters (e.g. Psalm 119).
- **Live & Final Statistics**:
  - Gross WPM: `(Total Characters / 5) / Elapsed Minutes`
  - Net WPM: `max(0, ((Correct Characters / 5) - Uncorrected Errors) / Elapsed Minutes)`
  - Accuracy: `(Correct Characters / Total Characters Typed) * 100`
  - Cumulative running totals across multi-unit Book and Continuous runs.
  - Safeguarded against zero-duration and empty sessions (no `NaN`, `Infinity`, or negative values).
- **Settings & Preferences**:
  - Font sizes (`sm`, `md`, `lg`, `xl`)
  - Caret styles (`line`, `block`, `underline`)
  - Mechanical switch sound toggle (Web Audio API, offline, zero assets)
  - Reduced motion support
  - Progress reset with safety confirmation dialog
- **Persistence**:
  - Versioned LocalStorage schema (`bibletype_store_v1`) with migration and corrupt-data protection.
  - Tracks personal bests, recent 50 sessions, completed scriptures, and active runs.
  - Resume interrupted continuous or book runs seamlessly after refresh.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Restart active unit |
| `Esc` | Pause session / Resume |
| `Ctrl + Backspace` | Delete previous word |
| `Enter` | Continue to next unit (in Summary modal) |

## 📖 Scripture Coverage

The app only ever shows scripture text it actually holds. It never generates, paraphrases or pads a
verse; if text for a verse is not bundled it says so and disables typing for it.

| Translation | Coverage |
| --- | --- |
| **AYT** (Indonesian) | Complete — all 66 books, **31,102 verses**, Kejadian 1:1 through Wahyu 22:21 |
| **WEB** (English) | Partial — a small authentic excerpt only |

Full provenance, the source checksum and the licensing terms for the AYT text are documented in
[`src/data/ayt/PROVENANCE.md`](src/data/ayt/PROVENANCE.md).

## 📜 Licensing & Attribution

- **World English Bible (WEB)**: Dedicated to the Public Domain.
- **Alkitab Yang Terbuka (AYT)**: © 2011–2024 Yayasan Lembaga SABDA (YLSA) / [ayt.co](https://ayt.co).
  Used **non-commercially** under YLSA's own grant: *"AYT - usage (non-commercial) is CopyLefted,
  2011 — this is to allow free usage/distribution of the text"*, with derivatives under
  CC BY-NC-SA. Permissions are managed by YLSA (ylsa@sabda.org). The copyright and licence notice
  is reproduced in the app footer and in the bundled data.

## 🚀 Development & Testing

```bash
# Start development server
npm run dev

# Run full test suite
npm test

# Production build & typecheck
npm run build
```

### AYT data pipeline

```bash
npm run ayt:fetch    # download the pinned upstream AYT artifact and verify its SHA-256
npm run ayt:build    # validate + recompile the bundled verse-indexed dataset
npm run ayt:verify   # compare all 31,102 shipped verses byte-for-byte against the original source
npm run ayt:coverage # write reports/ayt-coverage.md (per-book and per-chapter coverage)
```
