import { Translation } from '../data/scriptureStore';
import { RunningTotals } from './statsCalculator';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type CaretStyle = 'line' | 'block' | 'underline';
export type AutoContinueMode = 'immediate' | 'summary';

export interface UserSettings {
  language: Translation;
  fontSize: FontSize;
  caretStyle: CaretStyle;
  soundEnabled: boolean;
  soundVolume: number;
  autoContinue: AutoContinueMode;
  reducedMotion: boolean;
  smoothScroll: boolean;
  ignoreCase: boolean;
}

export interface SessionRecord {
  id: string;
  date: string;
  reference: string;
  translation: Translation;
  mode: 'single' | 'book' | 'continuous';
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  elapsedSeconds: number;
  totalChars: number;
  errors: number;
}

export interface UserProgress {
  personalBests: {
    highestWpm: number;
    highestAccuracy: number;
    longestStreakDays: number;
  };
  recentSessions: SessionRecord[];
  completedPassages: Record<string, { count: number; bestWpm: number; lastCompleted: string }>;
}

export interface ActiveRunState {
  mode: 'book' | 'continuous';
  bookId: string;
  chapter: number;
  startVerse?: number;
  unitIndex: number;
  runningTotals: RunningTotals;
}

export interface CurrentPosition {
  bookId: string;
  chapter: number;
  verse: number;
}

export interface VerseEntry {
  id: string; // Keyed e.g. "entry_SNG_1_1" or unique id
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string; // e.g. "Kidung Agung 1:1"
  translation: Translation;
  verseText: string;
  typedText?: string;
  savedAt: string;
  updatedAt?: string;
  wpm?: number;
  accuracy?: number;
}

export interface BibleTypeStore {
  version: 2;
  settings: UserSettings;
  progress: UserProgress;
  activeRun: ActiveRunState | null;
  currentPosition: CurrentPosition;
  savedEntries: VerseEntry[];
}

const STORAGE_KEY = 'bibletype_store_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'AYT',
  fontSize: 'md',
  caretStyle: 'line',
  soundEnabled: false,
  soundVolume: 0.2,
  autoContinue: 'immediate',
  reducedMotion: false,
  smoothScroll: true,
  ignoreCase: false,
};

export const DEFAULT_PROGRESS: UserProgress = {
  personalBests: {
    highestWpm: 0,
    highestAccuracy: 0,
    longestStreakDays: 0,
  },
  recentSessions: [],
  completedPassages: {},
};

export const DEFAULT_POSITION: CurrentPosition = {
  bookId: 'SNG', // Kidung Agung
  chapter: 1,
  verse: 1,
};

export const DEFAULT_STORE: BibleTypeStore = {
  version: 2,
  settings: DEFAULT_SETTINGS,
  progress: DEFAULT_PROGRESS,
  activeRun: null,
  currentPosition: DEFAULT_POSITION,
  savedEntries: [],
};

/**
 * Validates and migrates raw data from LocalStorage to the current versioned schema (v2).
 * Preserves all existing sessions, personal bests, completed scriptures, and settings.
 */
export function migrateStore(raw: unknown): BibleTypeStore {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }

  const data = raw as Partial<BibleTypeStore> & {
    version?: number;
    currentPosition?: Partial<CurrentPosition>;
    savedEntries?: unknown[];
  };

  // Migrate or preserve settings (AYT only)
  const settings: UserSettings = {
    language: 'AYT',
    fontSize: ['sm', 'md', 'lg', 'xl'].includes(data.settings?.fontSize as string)
      ? (data.settings?.fontSize as FontSize)
      : 'md',
    caretStyle: ['line', 'block', 'underline'].includes(data.settings?.caretStyle as string)
      ? (data.settings?.caretStyle as CaretStyle)
      : 'line',
    soundEnabled: Boolean(data.settings?.soundEnabled),
    soundVolume: typeof data.settings?.soundVolume === 'number'
      ? Math.max(0, Math.min(1, data.settings.soundVolume))
      : 0.2,
    autoContinue: data.settings?.autoContinue === 'summary' ? 'summary' : 'immediate',
    reducedMotion: Boolean(data.settings?.reducedMotion),
    smoothScroll: data.settings?.smoothScroll !== undefined ? Boolean(data.settings.smoothScroll) : true,
    ignoreCase: Boolean(data.settings?.ignoreCase),
  };

  // Migrate or preserve progress
  const progress: UserProgress = {
    personalBests: {
      highestWpm: typeof data.progress?.personalBests?.highestWpm === 'number'
        ? data.progress.personalBests.highestWpm
        : 0,
      highestAccuracy: typeof data.progress?.personalBests?.highestAccuracy === 'number'
        ? data.progress.personalBests.highestAccuracy
        : 0,
      longestStreakDays: typeof data.progress?.personalBests?.longestStreakDays === 'number'
        ? data.progress.personalBests.longestStreakDays
        : 0,
    },
    recentSessions: Array.isArray(data.progress?.recentSessions)
      ? data.progress.recentSessions.slice(0, 50).filter(s => s && typeof s.id === 'string')
      : [],
    completedPassages: data.progress?.completedPassages && typeof data.progress.completedPassages === 'object'
      ? data.progress.completedPassages
      : {},
  };

  // Migrate active run
  let activeRun: ActiveRunState | null = null;
  if (data.activeRun && (data.activeRun.mode === 'book' || data.activeRun.mode === 'continuous')) {
    activeRun = {
      mode: data.activeRun.mode,
      bookId: data.activeRun.bookId || 'GEN',
      chapter: typeof data.activeRun.chapter === 'number' ? data.activeRun.chapter : 1,
      startVerse: data.activeRun.startVerse,
      unitIndex: typeof data.activeRun.unitIndex === 'number' ? data.activeRun.unitIndex : 1,
      runningTotals: {
        totalChars: data.activeRun.runningTotals?.totalChars || 0,
        correctChars: data.activeRun.runningTotals?.correctChars || 0,
        totalErrors: data.activeRun.runningTotals?.totalErrors || 0,
        totalTimeSec: data.activeRun.runningTotals?.totalTimeSec || 0,
        unitsCompleted: data.activeRun.runningTotals?.unitsCompleted || 0,
      },
    };
  }

  // Persistent Bible reading position
  const currentPosition: CurrentPosition = {
    bookId: typeof data.currentPosition?.bookId === 'string' && data.currentPosition.bookId
      ? data.currentPosition.bookId
      : activeRun?.bookId || DEFAULT_POSITION.bookId,
    chapter: typeof data.currentPosition?.chapter === 'number' && data.currentPosition.chapter >= 1
      ? data.currentPosition.chapter
      : activeRun?.chapter || DEFAULT_POSITION.chapter,
    verse: typeof data.currentPosition?.verse === 'number' && data.currentPosition.verse >= 1
      ? data.currentPosition.verse
      : activeRun?.startVerse || DEFAULT_POSITION.verse,
  };

  // Individual verse entries
  const savedEntries: VerseEntry[] = Array.isArray(data.savedEntries)
    ? (data.savedEntries as VerseEntry[]).filter(
        e => e && typeof e.bookId === 'string' && typeof e.chapter === 'number' && typeof e.verse === 'number'
      )
    : [];

  return {
    version: 2,
    settings,
    progress,
    activeRun,
    currentPosition,
    savedEntries,
  };
}

export function loadStore(): BibleTypeStore {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(DEFAULT_STORE));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STORE));
    const parsed = JSON.parse(raw);
    return migrateStore(parsed);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }
}

export function saveStore(store: BibleTypeStore): boolean {
  if (typeof window === 'undefined') return true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves or updates an individual verse entry with duplicate prevention.
 * If saving fails (e.g. storage quota), returns success: false with error details.
 */
export function saveVerseEntry(
  entryData: {
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    reference: string;
    translation: Translation;
    verseText: string;
    typedText?: string;
    wpm?: number;
    accuracy?: number;
  }
): { success: boolean; entry?: VerseEntry; isUpdate: boolean; error?: string } {
  try {
    const store = loadStore();
    const existingIndex = store.savedEntries.findIndex(
      e => e.bookId === entryData.bookId && e.chapter === entryData.chapter && e.verse === entryData.verse
    );

    const now = new Date().toISOString();
    let savedEntry: VerseEntry;
    let isUpdate = false;

    if (existingIndex >= 0) {
      // Update existing entry (prevents accidental duplicate)
      isUpdate = true;
      const existing = store.savedEntries[existingIndex];
      savedEntry = {
        ...existing,
        reference: entryData.reference,
        translation: entryData.translation,
        verseText: entryData.verseText,
        typedText: entryData.typedText ?? existing.typedText,
        wpm: entryData.wpm ?? existing.wpm,
        accuracy: entryData.accuracy ?? existing.accuracy,
        updatedAt: now,
      };
      store.savedEntries[existingIndex] = savedEntry;
    } else {
      // Create new independent verse entry
      savedEntry = {
        id: `entry_${entryData.bookId}_${entryData.chapter}_${entryData.verse}_${Date.now()}`,
        bookId: entryData.bookId,
        bookName: entryData.bookName,
        chapter: entryData.chapter,
        verse: entryData.verse,
        reference: entryData.reference,
        translation: entryData.translation,
        verseText: entryData.verseText,
        typedText: entryData.typedText,
        savedAt: now,
        wpm: entryData.wpm,
        accuracy: entryData.accuracy,
      };
      store.savedEntries.push(savedEntry);
    }

    const saved = saveStore(store);
    if (!saved) {
      return { success: false, isUpdate, error: 'Storage operation failed (possible quota exceeded).' };
    }

    return { success: true, entry: savedEntry, isUpdate };
  } catch (err) {
    return {
      success: false,
      isUpdate: false,
      error: err instanceof Error ? err.message : 'Unknown storage error',
    };
  }
}

/**
 * Edits a previous verse entry's content or notes without changing current reading position.
 */
export function updatePreviousVerseEntry(
  entryId: string,
  updates: { verseText?: string; typedText?: string; notes?: string }
): { success: boolean; entry?: VerseEntry; error?: string } {
  try {
    const store = loadStore();
    const index = store.savedEntries.findIndex(e => e.id === entryId);
    if (index === -1) {
      return { success: false, error: 'Entry not found.' };
    }

    const updated = {
      ...store.savedEntries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.savedEntries[index] = updated;

    const saved = saveStore(store);
    if (!saved) {
      return { success: false, error: 'Failed to write updated entry to storage.' };
    }

    return { success: true, entry: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown update error',
    };
  }
}

/**
 * Checks if a verse is already saved and returns the entry.
 */
export function getSavedVerseEntry(
  bookId: string,
  chapter: number,
  verse: number
): VerseEntry | undefined {
  const store = loadStore();
  return store.savedEntries.find(
    e => e.bookId === bookId && e.chapter === chapter && e.verse === verse
  );
}

/**
 * Persists the current Bible reading position.
 */
export function persistCurrentPosition(position: CurrentPosition): boolean {
  const store = loadStore();
  store.currentPosition = position;
  return saveStore(store);
}

export function resetProgressInStorage(): BibleTypeStore {
  const current = loadStore();
  const next: BibleTypeStore = {
    ...current,
    progress: DEFAULT_PROGRESS,
    activeRun: null,
    savedEntries: [],
    currentPosition: DEFAULT_POSITION,
  };
  saveStore(next);
  return next;
}
