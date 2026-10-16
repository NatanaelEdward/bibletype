import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateStore,
  loadStore,
  saveStore,
  resetProgressInStorage,
  DEFAULT_STORE,
  BibleTypeStore,
} from '../utils/storage';

describe('Storage & Migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('safely handles null, undefined, or empty data with DEFAULT_STORE', () => {
    expect(migrateStore(null)).toEqual(DEFAULT_STORE);
    expect(migrateStore(undefined)).toEqual(DEFAULT_STORE);
    expect(migrateStore('corrupted string')).toEqual(DEFAULT_STORE);
    expect(migrateStore({})).toEqual(DEFAULT_STORE);
  });

  it('safely migrates malformed or partially missing storage objects', () => {
    const malformed = {
      version: 0,
      settings: {
        fontSize: 'gigantic', // invalid font size
        language: 'GERMAN', // invalid language
        autoContinue: 'immediate',
      },
      progress: {
        personalBests: { highestWpm: 'not a number' }, // invalid type
        recentSessions: [null, { invalid: true }],
      },
    };

    const migrated = migrateStore(malformed);
    expect(migrated.version).toBe(2);
    expect(migrated.settings.fontSize).toBe('md'); // fell back to default
    expect(migrated.settings.language).toBe('AYT'); // fell back to default
    expect(migrated.settings.autoContinue).toBe('immediate');
    expect(migrated.progress.personalBests.highestWpm).toBe(0); // safe fallback
    expect(migrated.progress.recentSessions).toEqual([]); // cleaned invalid items
  });

  it('saves and loads store faithfully to LocalStorage', () => {
    const customStore: BibleTypeStore = {
      version: 2,
      settings: {
        language: 'AYT',
        fontSize: 'lg',
        caretStyle: 'block',
        soundEnabled: true,
        soundVolume: 0.5,
        autoContinue: 'summary',
        reducedMotion: true,
      },
      progress: {
        personalBests: {
          highestWpm: 85,
          highestAccuracy: 99.2,
          longestStreakDays: 5,
        },
        recentSessions: [
          {
            id: 'sess_1',
            date: '2026-10-17T00:00:00.000Z',
            reference: 'Mazmur 23',
            translation: 'AYT',
            mode: 'book',
            grossWpm: 90,
            netWpm: 85,
            accuracy: 99.2,
            elapsedSeconds: 45,
            totalChars: 300,
            errors: 2,
          },
        ],
        completedPassages: {
          'Mazmur 23': { count: 1, bestWpm: 85, lastCompleted: '2026-10-17' },
        },
      },
      activeRun: {
        mode: 'continuous',
        bookId: 'JHN',
        chapter: 3,
        startVerse: 16,
        unitIndex: 1,
        runningTotals: {
          totalChars: 300,
          correctChars: 298,
          totalErrors: 2,
          totalTimeSec: 45,
          unitsCompleted: 1,
        },
      },
      currentPosition: {
        bookId: 'JHN',
        chapter: 3,
        verse: 16,
      },
      savedEntries: [],
    };

    saveStore(customStore);
    const loaded = loadStore();

    expect(loaded.settings.language).toBe('AYT');
    expect(loaded.settings.fontSize).toBe('lg');
    expect(loaded.progress.personalBests.highestWpm).toBe(85);
    expect(loaded.activeRun?.bookId).toBe('JHN');
    expect(loaded.activeRun?.unitIndex).toBe(1);
    expect(loaded.currentPosition.bookId).toBe('JHN');
  });

  it('resets progress without wiping user preferences', () => {
    const customStore: BibleTypeStore = {
      version: 2,
      settings: {
        language: 'AYT',
        fontSize: 'xl',
        caretStyle: 'underline',
        soundEnabled: true,
        soundVolume: 0.3,
        autoContinue: 'summary',
        reducedMotion: false,
      },
      progress: {
        personalBests: { highestWpm: 120, highestAccuracy: 100, longestStreakDays: 10 },
        recentSessions: [{ id: '1', date: '', reference: '', translation: 'AYT', mode: 'single', grossWpm: 0, netWpm: 0, accuracy: 0, elapsedSeconds: 0, totalChars: 0, errors: 0 }],
        completedPassages: { 'GEN 1': { count: 5, bestWpm: 100, lastCompleted: '' } },
      },
      activeRun: {
        mode: 'continuous',
        bookId: 'REV',
        chapter: 21,
        unitIndex: 15,
        runningTotals: { totalChars: 5000, correctChars: 4900, totalErrors: 20, totalTimeSec: 1000, unitsCompleted: 15 },
      },
      currentPosition: {
        bookId: 'REV',
        chapter: 21,
        verse: 1,
      },
      savedEntries: [],
    };

    saveStore(customStore);
    const afterReset = resetProgressInStorage();

    // Settings preserved
    expect(afterReset.settings.language).toBe('AYT');
    expect(afterReset.settings.fontSize).toBe('xl');

    // Progress and active run reset
    expect(afterReset.progress.personalBests.highestWpm).toBe(0);
    expect(afterReset.progress.recentSessions).toEqual([]);
    expect(afterReset.progress.completedPassages).toEqual({});
    expect(afterReset.activeRun).toBeNull();
  });
});
