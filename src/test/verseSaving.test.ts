import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveVerseEntry,
  updatePreviousVerseEntry,
  getSavedVerseEntry,
  persistCurrentPosition,
  loadStore,
  migrateStore,
} from '../utils/storage';

describe('Verse Entry Saving, Duplicate Prevention & Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves an individual verse entry with reference and content together', () => {
    const res = saveVerseEntry({
      bookId: 'SNG',
      bookName: 'Kidung Agung',
      chapter: 1,
      verse: 1,
      reference: 'Kidung Agung 1:1',
      translation: 'AYT',
      verseText: 'Kidung agung dari Salomo.',
      typedText: 'Kidung agung dari Salomo.',
      wpm: 65,
      accuracy: 98.5,
    });

    expect(res.success).toBe(true);
    expect(res.isUpdate).toBe(false);
    expect(res.entry).toBeDefined();
    expect(res.entry?.reference).toBe('Kidung Agung 1:1');
    expect(res.entry?.verseText).toBe('Kidung agung dari Salomo.');

    const saved = getSavedVerseEntry('SNG', 1, 1);
    expect(saved).toBeDefined();
    expect(saved?.bookId).toBe('SNG');
    expect(saved?.chapter).toBe(1);
    expect(saved?.verse).toBe(1);
  });

  it('prevents accidental duplicate entries for the same verse and updates existing entry', () => {
    // Save verse 1
    saveVerseEntry({
      bookId: 'SNG',
      bookName: 'Kidung Agung',
      chapter: 1,
      verse: 2,
      reference: 'Kidung Agung 1:2',
      translation: 'AYT',
      verseText: 'Original text',
      wpm: 60,
      accuracy: 95,
    });

    const storeBefore = loadStore();
    expect(storeBefore.savedEntries.length).toBe(1);

    // Re-save the exact same verse with updated stats
    const updateRes = saveVerseEntry({
      bookId: 'SNG',
      bookName: 'Kidung Agung',
      chapter: 1,
      verse: 2,
      reference: 'Kidung Agung 1:2',
      translation: 'AYT',
      verseText: 'Updated text content',
      wpm: 75,
      accuracy: 99,
    });

    expect(updateRes.success).toBe(true);
    expect(updateRes.isUpdate).toBe(true);

    const storeAfter = loadStore();
    // Length must still be 1 (no duplicate created!)
    expect(storeAfter.savedEntries.length).toBe(1);
    expect(storeAfter.savedEntries[0].verseText).toBe('Updated text content');
    expect(storeAfter.savedEntries[0].wpm).toBe(75);
    expect(storeAfter.savedEntries[0].updatedAt).toBeDefined();
  });

  it('preserves existing records during migration from v1 schema to v2 schema', () => {
    // Simulate legacy v1 store with existing sessions and completed passages
    const legacyV1Store = {
      version: 1,
      settings: {
        language: 'AYT',
        fontSize: 'lg',
        caretStyle: 'line',
        soundEnabled: false,
        soundVolume: 0.2,
        autoContinue: 'immediate',
        reducedMotion: false,
      },
      progress: {
        personalBests: { highestWpm: 88, highestAccuracy: 100, longestStreakDays: 3 },
        recentSessions: [
          {
            id: 'sess_legacy_1',
            date: '2026-10-16T12:00:00Z',
            reference: 'Mazmur 23',
            translation: 'AYT',
            mode: 'book',
            grossWpm: 90,
            netWpm: 88,
            accuracy: 100,
            elapsedSeconds: 30,
            totalChars: 150,
            errors: 0,
          },
        ],
        completedPassages: {
          'Mazmur 23': { count: 2, bestWpm: 88, lastCompleted: '2026-10-16T12:00:00Z' },
        },
      },
      activeRun: null,
    };

    const migrated = migrateStore(legacyV1Store);

    expect(migrated.version).toBe(2);
    // Preserved existing progress and settings
    expect(migrated.progress.personalBests.highestWpm).toBe(88);
    expect(migrated.progress.recentSessions).toHaveLength(1);
    expect(migrated.progress.completedPassages['Mazmur 23'].count).toBe(2);
    expect(migrated.settings.language).toBe('AYT');
    expect(migrated.settings.fontSize).toBe('lg');

    // Initialized new v2 fields cleanly
    expect(migrated.currentPosition).toBeDefined();
    expect(migrated.currentPosition.bookId).toBe('SNG');
    expect(migrated.savedEntries).toEqual([]);
  });

  it('persists and resumes current Bible position across page reloads', () => {
    persistCurrentPosition({ bookId: 'SNG', chapter: 1, verse: 3 });

    const loaded = loadStore();
    expect(loaded.currentPosition.bookId).toBe('SNG');
    expect(loaded.currentPosition.chapter).toBe(1);
    expect(loaded.currentPosition.verse).toBe(3);
  });

  it('edits a previous entry without changing the active reading position', () => {
    // Set active reading position to Kidung Agung 1:5
    persistCurrentPosition({ bookId: 'SNG', chapter: 1, verse: 5 });

    // Save verse Kidung Agung 1:1
    const res = saveVerseEntry({
      bookId: 'SNG',
      bookName: 'Kidung Agung',
      chapter: 1,
      verse: 1,
      reference: 'Kidung Agung 1:1',
      translation: 'AYT',
      verseText: 'Original text for verse 1',
    });

    const entryId = res.entry!.id;

    // Edit verse 1
    const editRes = updatePreviousVerseEntry(entryId, {
      verseText: 'Carefully edited text for verse 1',
    });

    expect(editRes.success).toBe(true);

    const store = loadStore();
    // Entry content was updated
    expect(store.savedEntries.find(e => e.id === entryId)?.verseText).toBe(
      'Carefully edited text for verse 1'
    );
    // Active reading position is still at Kidung Agung 1:5!
    expect(store.currentPosition.bookId).toBe('SNG');
    expect(store.currentPosition.chapter).toBe(1);
    expect(store.currentPosition.verse).toBe(5);
  });

  it('gracefully handles storage failures without crashing', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError: LocalStorage quota exceeded');
    });

    const res = saveVerseEntry({
      bookId: 'SNG',
      bookName: 'Kidung Agung',
      chapter: 1,
      verse: 99,
      reference: 'Kidung Agung 1:99',
      translation: 'AYT',
      verseText: 'Test text',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();

    setItemSpy.mockRestore();
  });
});
