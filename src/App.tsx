import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TypingArea } from './components/TypingArea';
import { PassageSelector } from './components/PassageSelector';
import { SettingsModal } from './components/SettingsModal';
import { ProgressModal } from './components/ProgressModal';
import { ResultsModal } from './components/ResultsModal';
import { SavedEntriesModal } from './components/SavedEntriesModal';
import { useTypingEngine } from './hooks/useTypingEngine';
import {
  getVerse,
  VerseResult,
} from './data/scriptureStore';
import {
  getNextVersePosition,
  getPrevVersePosition,
  getBookById,
  getNextBook,
  getTotalVersesInBook,
  getVerseIndexInBook,
  isLastVerseInBook,
} from './data/bibleData';
import {
  loadStore,
  saveStore,
  saveVerseEntry,
  persistCurrentPosition,
  resetProgressInStorage,
  BibleTypeStore,
  UserSettings,
  SessionRecord,
} from './utils/storage';
import {
  calculateCumulativeStats,
  RunningTotals,
  TypingStats,
} from './utils/statsCalculator';
import { normalizeScriptureText } from './utils/charMatcher';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function App() {
  // Persistence store
  const [store, setStore] = useState<BibleTypeStore>(() => loadStore());

  // Practice mode: 'single' (Ayat Pilihan), 'book' (Per Kitab), 'continuous' (Lanjutkan)
  const [mode, setMode] = useState<'single' | 'book' | 'continuous'>(() => {
    return store.activeRun ? store.activeRun.mode : 'single';
  });

  // Persistent Bible Reading Position (Book, Chapter, Verse)
  const [bookId, setBookId] = useState<string>(() => {
    return store.currentPosition?.bookId || 'SNG';
  });

  const [chapter, setChapter] = useState<number>(() => {
    return store.currentPosition?.chapter || 1;
  });

  const [verse, setVerse] = useState<number>(() => {
    return store.currentPosition?.verse || 1;
  });

  const [, setUnitIndex] = useState<number>(() => {
    return store.activeRun ? store.activeRun.unitIndex : 1;
  });

  const [runningTotals, setRunningTotals] = useState<RunningTotals>(() => {
    return store.activeRun
      ? store.activeRun.runningTotals
      : {
          totalChars: 0,
          correctChars: 0,
          totalErrors: 0,
          totalTimeSec: 0,
          unitsCompleted: 0,
        };
  });

  // UI & Modals state
  const [showPassageSelector, setShowPassageSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showSavedEntries, setShowSavedEntries] = useState(false);
  const [completedStats, setCompletedStats] = useState<TypingStats | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [bookCompletionShown, setBookCompletionShown] = useState<boolean>(false);

  // Sync store to LocalStorage
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Persist current Bible position whenever it changes
  useEffect(() => {
    persistCurrentPosition({ bookId, chapter, verse });
    setStore(prev => ({
      ...prev,
      currentPosition: { bookId, chapter, verse },
    }));
  }, [bookId, chapter, verse]);

  // Resolve current active verse in Indonesian AYT
  const currentVerseResult: VerseResult = useMemo(() => {
    return getVerse(bookId, chapter, verse, 'AYT');
  }, [bookId, chapter, verse]);

  const targetText = useMemo(() => {
    return normalizeScriptureText(currentVerseResult.text);
  }, [currentVerseResult.text]);

  // Calculate next and previous verse positions
  const nextVersePos = useMemo(() => {
    return getNextVersePosition(bookId, chapter, verse);
  }, [bookId, chapter, verse]);

  const prevVersePos = useMemo(() => {
    return getPrevVersePosition(bookId, chapter, verse);
  }, [bookId, chapter, verse]);

  // Next verse preview
  const nextVerseResult = useMemo(() => {
    if (nextVersePos.isEnd) return null;
    return getVerse(nextVersePos.bookId, nextVersePos.chapter, nextVersePos.verse, 'AYT');
  }, [nextVersePos]);

  // Book metadata & progress
  const currentBook = useMemo(() => {
    return getBookById(bookId);
  }, [bookId]);

  const nextBook = useMemo(() => {
    return getNextBook(bookId);
  }, [bookId]);

  const totalVersesInCurrentBook = useMemo(() => {
    return getTotalVersesInBook(bookId);
  }, [bookId]);

  const currentVerseIndexInBook = useMemo(() => {
    return getVerseIndexInBook(bookId, chapter, verse);
  }, [bookId, chapter, verse]);

  const isCurrentVerseLastInBook = useMemo(() => {
    return isLastVerseInBook(bookId, chapter, verse);
  }, [bookId, chapter, verse]);

  const bookProgressPercent = useMemo(() => {
    if (totalVersesInCurrentBook === 0) return 0;
    return Math.round((currentVerseIndexInBook / totalVersesInCurrentBook) * 100);
  }, [currentVerseIndexInBook, totalVersesInCurrentBook]);

  // Check if current verse is already saved
  const existingSavedEntry = useMemo(() => {
    return store.savedEntries.find(
      e => e.bookId === bookId && e.chapter === chapter && e.verse === verse
    );
  }, [store.savedEntries, bookId, chapter, verse]);

  // Last saved verse in entries list
  const lastSavedEntry = useMemo(() => {
    if (store.savedEntries.length === 0) return null;
    return store.savedEntries[store.savedEntries.length - 1];
  }, [store.savedEntries]);

  // Manual verse navigation
  const handleNextVerse = useCallback(() => {
    if (nextVersePos.isEnd) return;
    setBookId(nextVersePos.bookId);
    setChapter(nextVersePos.chapter);
    setVerse(nextVersePos.verse);
    setCompletedStats(null);
    setSaveError(null);
    setBookCompletionShown(false);
  }, [nextVersePos]);

  const handlePrevVerse = useCallback(() => {
    if (prevVersePos.isStart) return;
    setBookId(prevVersePos.bookId);
    setChapter(prevVersePos.chapter);
    setVerse(prevVersePos.verse);
    setCompletedStats(null);
    setSaveError(null);
    setBookCompletionShown(false);
  }, [prevVersePos]);

  // Save current verse entry with data integrity
  const executeSaveVerse = useCallback(
    (stats: TypingStats, shouldAdvance = true): boolean => {
      // Never store a non-verse: without authentic text there is nothing meaningful to save.
      if (!currentVerseResult.textAvailable) {
        setSaveError(
          `Teks Alkitab AYT belum tersedia untuk ${currentVerseResult.reference}, sehingga tidak ada yang dapat diketik atau disimpan. Aplikasi tidak membuat teks tiruan.`
        );
        return false;
      }

      const saveResult = saveVerseEntry({
        bookId,
        bookName: currentVerseResult.bookName,
        chapter,
        verse,
        reference: currentVerseResult.reference,
        translation: 'AYT',
        verseText: currentVerseResult.text,
        wpm: stats.netWpm,
        accuracy: stats.accuracy,
      });

      if (!saveResult.success) {
        setSaveError(saveResult.error || 'Gagal menyimpan ayat. Teks dan posisi Anda tetap aman. Silakan coba lagi.');
        return false;
      }

      setSaveError(null);
      setSaveSuccessNotice(`${currentVerseResult.reference} berhasil disimpan!`);
      setTimeout(() => setSaveSuccessNotice(null), 3000);

      // Refresh store with latest saved entries
      setStore(loadStore());

      // Advance logic depending on mode and book boundaries
      if (shouldAdvance) {
        if (mode === 'book' && isCurrentVerseLastInBook) {
          // In Per Kitab mode, pause at book completion and do not silently leave
          setBookCompletionShown(true);
        } else if (!nextVersePos.isEnd) {
          setBookId(nextVersePos.bookId);
          setChapter(nextVersePos.chapter);
          setVerse(nextVersePos.verse);
          setUnitIndex(prev => prev + 1);
        }
      }

      return true;
    },
    [bookId, chapter, verse, currentVerseResult, mode, isCurrentVerseLastInBook, nextVersePos]
  );

  // Advance to next canonical book (used when user chooses to continue after book completion)
  const handleContinueToNextBook = useCallback(() => {
    if (!nextBook) return;
    setBookId(nextBook.id);
    setChapter(1);
    setVerse(1);
    setUnitIndex(1);
    setCompletedStats(null);
    setSaveError(null);
    setBookCompletionShown(false);
  }, [nextBook]);

  // Completion callback triggered by useTypingEngine
  const handleUnitComplete = useCallback(
    (stats: TypingStats) => {
      // 1. Calculate cumulative totals
      const cumulativeResult = calculateCumulativeStats(runningTotals, stats);
      const newTotals = cumulativeResult.runningTotals;
      setRunningTotals(newTotals);

      // 2. Create session record
      const session: SessionRecord = {
        id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: new Date().toISOString(),
        reference: currentVerseResult.reference,
        translation: 'AYT',
        mode,
        grossWpm: stats.grossWpm,
        netWpm: stats.netWpm,
        accuracy: stats.accuracy,
        elapsedSeconds: stats.elapsedSeconds,
        totalChars: stats.totalCharsTyped,
        errors: stats.incorrectChars,
      };

      // 3. Update store
      setStore(prev => {
        const prevBests = prev.progress.personalBests;
        const highestWpm = Math.max(prevBests.highestWpm, stats.netWpm);
        const highestAccuracy = Math.max(prevBests.highestAccuracy, stats.accuracy);

        const currentPassageData = prev.progress.completedPassages[currentVerseResult.reference];
        const newCount = (currentPassageData?.count || 0) + 1;
        const bestWpm = Math.max(currentPassageData?.bestWpm || 0, stats.netWpm);

        const updatedCompleted = {
          ...prev.progress.completedPassages,
          [currentVerseResult.reference]: {
            count: newCount,
            bestWpm,
            lastCompleted: session.date,
          },
        };

        return {
          ...prev,
          progress: {
            personalBests: {
              ...prevBests,
              highestWpm,
              highestAccuracy,
            },
            recentSessions: [session, ...prev.progress.recentSessions].slice(0, 50),
            completedPassages: updatedCompleted,
          },
        };
      });

      // 4. Auto-save entry and advance if immediate
      if (store.settings.autoContinue === 'immediate') {
        if (mode === 'book' && isCurrentVerseLastInBook) {
          executeSaveVerse(stats, false);
          setCompletedStats(stats);
          setBookCompletionShown(true);
        } else {
          executeSaveVerse(stats, true);
        }
      } else {
        // Show summary modal with option to continue and save
        setCompletedStats(stats);
      }
    },
    [
      runningTotals,
      currentVerseResult.reference,
      store.settings.autoContinue,
      mode,
      isCurrentVerseLastInBook,
      executeSaveVerse,
    ]
  );

  // Initialize typing engine
  const {
    cursor,
    typedHistory,
    status,
    liveStats,
    handleCharInput,
    handleBackspace,
    handleBackspaceWord,
    restart,
    pause,
    resume,
  } = useTypingEngine({
    targetText,
    soundEnabled: store.settings.soundEnabled,
    soundVolume: store.settings.soundVolume,
    ignoreCase: store.settings.ignoreCase,
    onComplete: handleUnitComplete,
  });

  const handlePauseToggle = useCallback(() => {
    if (status === 'typing') {
      pause();
    } else if (status === 'paused') {
      resume();
    }
  }, [status, pause, resume]);

  // Mode changes
  const handleModeChange = (newMode: 'single' | 'book' | 'continuous') => {
    const currentStore = loadStore();
    setStore(currentStore);
    setMode(newMode);
    setUnitIndex(1);
    setRunningTotals({
      totalChars: 0,
      correctChars: 0,
      totalErrors: 0,
      totalTimeSec: 0,
      unitsCompleted: 0,
    });
    setCompletedStats(null);
    setSaveError(null);
    setBookCompletionShown(false);

    // Mode C: Lanjutkan - restore user's saved overall Bible position if available
    if (newMode === 'continuous') {
      if (currentStore.savedEntries.length > 0) {
        const lastEntry = currentStore.savedEntries[currentStore.savedEntries.length - 1];
        setBookId(lastEntry.bookId);
        setChapter(lastEntry.chapter);
        setVerse(lastEntry.verse);
      } else if (currentStore.currentPosition) {
        setBookId(currentStore.currentPosition.bookId);
        setChapter(currentStore.currentPosition.chapter);
        setVerse(currentStore.currentPosition.verse);
      }
    }
  };

  // Update settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setStore(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  // Reset progress with confirmation
  const handleResetProgress = () => {
    const updated = resetProgressInStorage();
    setStore(updated);
    setBookId(updated.currentPosition.bookId);
    setChapter(updated.currentPosition.chapter);
    setVerse(updated.currentPosition.verse);
    setRunningTotals({
      totalChars: 0,
      correctChars: 0,
      totalErrors: 0,
      totalTimeSec: 0,
      unitsCompleted: 0,
    });
    setBookCompletionShown(false);
    restart();
  };

  // Cumulative stats
  const cumulativeStats = useMemo(() => {
    if (mode === 'single') return null;
    return calculateCumulativeStats(runningTotals, liveStats);
  }, [mode, runningTotals, liveStats]);

  // Passage/Verse selection handler (Preserves exact selected book, chapter, and verse)
  const handlePassageSelect = (selection: {
    bookId: string;
    chapter: number;
    startVerse?: number;
  }) => {
    setBookId(selection.bookId);
    setChapter(selection.chapter);
    setVerse(selection.startVerse || 1);
    setUnitIndex(1);
    setRunningTotals({
      totalChars: 0,
      correctChars: 0,
      totalErrors: 0,
      totalTimeSec: 0,
      unitsCompleted: 0,
    });
    setCompletedStats(null);
    setSaveError(null);
    setBookCompletionShown(false);
    restart();
  };

  // Jump to specific verse from saved entries or bookmarks
  const handleJumpToVerse = (jBookId: string, jChapter: number, jVerse: number) => {
    setBookId(jBookId);
    setChapter(jChapter);
    setVerse(jVerse);
    setCompletedStats(null);
    setSaveError(null);
    setBookCompletionShown(false);
    restart();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-[#F1F5F9]">
      {/* Header */}
      <Header
        mode={mode}
        savedEntriesCount={store.savedEntries.length}
        onModeChange={handleModeChange}
        onOpenSettings={() => setShowSettings(true)}
        onOpenProgress={() => setShowProgress(true)}
        onOpenSavedEntries={() => setShowSavedEntries(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-4 w-full max-w-5xl mx-auto">
        {/* Error Notification Banner if Save Fails */}
        {saveError && (
          <div className="w-full max-w-4xl mb-3 p-3 bg-red-950/70 border border-red-700/80 rounded-xl text-xs text-red-200 flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{saveError}</span>
            </div>
            <button
              onClick={() => executeSaveVerse(liveStats, false)}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg font-semibold text-xs ml-2"
            >
              Coba Simpan Lagi
            </button>
          </div>
        )}

        {/* Success Save Notice */}
        {saveSuccessNotice && (
          <div className="w-full max-w-4xl mb-3 p-2 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 size={15} />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Lanjutkan Mode Empty State Banner */}
        {mode === 'continuous' && store.savedEntries.length === 0 && (
          <div className="w-full max-w-4xl mb-3 p-3.5 bg-[#1E293B] border border-[#A78BFA]/40 rounded-xl text-xs text-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#A78BFA] shrink-0" />
              <span>
                Belum ada posisi tersimpan. Anda dapat mulai mengetik dari ayat saat ini, memilih ayat baru, atau mulai dari awal Alkitab.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleJumpToVerse('GEN', 1, 1)}
                className="px-3 py-1 bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] rounded-lg font-bold text-xs transition"
              >
                Mulai dari Kejadian 1:1
              </button>
              <button
                onClick={() => setShowPassageSelector(true)}
                className="px-3 py-1 bg-[#0F172A] border border-[#334155] hover:border-[#94A3B8] rounded-lg font-medium text-xs text-[#F1F5F9] transition"
              >
                Pilih Ayat
              </button>
            </div>
          </div>
        )}

        {/* Per Kitab Book Completion Banner */}
        {mode === 'book' && (bookCompletionShown || (isCurrentVerseLastInBook && existingSavedEntry)) && (
          <div className="w-full max-w-4xl mb-3 p-4 bg-emerald-950/40 border border-emerald-600/60 rounded-2xl text-xs text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-300">
                  Selamat! Anda telah menyelesaikan seluruh kitab {currentBook?.nameId || currentVerseResult.bookName}.
                </p>
                <p className="text-[11px] text-emerald-400/80">
                  Pilih kitab lain untuk diketik atau lanjutkan membaca ke kitab kanonikal berikutnya.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowPassageSelector(true)}
                className="px-3 py-1.5 bg-[#0F172A] border border-[#334155] hover:border-[#94A3B8] text-[#F1F5F9] rounded-xl font-medium text-xs flex items-center gap-1.5 transition"
              >
                <BookOpen size={14} />
                <span>Pilih Kitab Lain</span>
              </button>
              {nextBook && (
                <button
                  onClick={handleContinueToNextBook}
                  className="px-3.5 py-1.5 bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <span>Lanjut ke {nextBook.nameId}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Persistent Bible Reference Bar */}
        <div className="w-full max-w-4xl bg-[#1E293B] border border-[#334155] rounded-2xl p-4 mb-4 select-none shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Current Reference & Status */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-mono">Ayat Saat Ini</span>
                {existingSavedEntry ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} />
                    <span>Tersimpan</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#94A3B8] bg-[#0F172A] border border-[#334155] px-2 py-0.5 rounded-full">
                    <span>Belum Tersimpan</span>
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-[#0F172A] border border-[#334155] text-[#A78BFA] font-semibold">
                  AYT
                </span>

                {/* Per Kitab Progress Badge */}
                {mode === 'book' && totalVersesInCurrentBook > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0F172A] border border-[#334155] text-[#F1F5F9]">
                    Ayat {currentVerseIndexInBook} dari {totalVersesInCurrentBook} ({bookProgressPercent}%)
                  </span>
                )}
              </div>

              {/* Clickable Large Reference */}
              <div className="flex items-baseline gap-2 mt-1">
                <button
                  onClick={() => setShowPassageSelector(true)}
                  className="text-xl md:text-2xl font-bold text-[#F1F5F9] hover:text-[#A78BFA] transition flex items-center gap-2 group text-left"
                  title="Klik untuk berpindah kitab, pasal, atau ayat"
                >
                  <span>{currentVerseResult.reference}</span>
                  <span className="text-xs text-[#94A3B8] group-hover:text-[#A78BFA] font-normal transition">
                    (ganti)
                  </span>
                </button>
              </div>

              {/* Next verse indicator */}
              <div className="text-xs text-[#94A3B8] mt-1 font-mono">
                {nextVersePos.isEnd ? (
                  <span className="text-[#A78BFA]">Ayat terakhir Kitab Wahyu (Akhir Alkitab)</span>
                ) : (
                  <span>
                    Ayat berikutnya:{' '}
                    <strong className="text-[#F1F5F9]">
                      {nextVerseResult?.reference}
                    </strong>
                    {nextVerseResult && !nextVerseResult.textAvailable && (
                      <span className="text-[#A78BFA]"> — teks AYT belum tersedia</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation & Action Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Previous Verse Button */}
              <button
                onClick={handlePrevVerse}
                disabled={prevVersePos.isStart}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-[#334155] text-xs font-semibold text-[#F1F5F9] hover:border-[#818CF8]/60 hover:text-[#A78BFA] disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Kembali ke ayat sebelumnya"
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>

              {/* Next Verse Button */}
              <button
                onClick={handleNextVerse}
                disabled={nextVersePos.isEnd}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-[#334155] text-xs font-semibold text-[#F1F5F9] hover:border-[#818CF8]/60 hover:text-[#A78BFA] disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Lanjut ke ayat berikutnya"
              >
                <span>Berikutnya</span>
                <ChevronRight size={16} />
              </button>

              {/* Save Verse Button */}
              <button
                onClick={() => executeSaveVerse(liveStats, true)}
                disabled={!currentVerseResult.textAvailable}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] text-xs font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  currentVerseResult.textAvailable
                    ? 'Simpan ayat saat ini dan lanjut ke ayat berikutnya'
                    : 'Teks Alkitab AYT belum tersedia untuk ayat ini'
                }
              >
                <Save size={14} />
                <span>Simpan & Lanjut</span>
              </button>
            </div>
          </div>

          {/* Quick Resume Link if user browsed away from last saved position */}
          {lastSavedEntry &&
            (lastSavedEntry.bookId !== bookId ||
              lastSavedEntry.chapter !== chapter ||
              lastSavedEntry.verse !== verse) && (
              <div className="mt-3 pt-2.5 border-t border-[#334155]/60 flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-[#94A3B8]">
                  Ayat terakhir tersimpan: <strong className="text-[#F1F5F9]">{lastSavedEntry.reference}</strong>
                </span>
                <button
                  onClick={() =>
                    handleJumpToVerse(
                      lastSavedEntry.bookId,
                      lastSavedEntry.chapter,
                      lastSavedEntry.verse
                    )
                  }
                  className="text-xs text-[#A78BFA] hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Lanjutkan dari posisi tersimpan</span>
                </button>
              </div>
            )}
        </div>

        {/* Core Typing Screen, or an honest notice when this verse has no bundled text */}
        {currentVerseResult.textAvailable ? (
          <TypingArea
            targetText={targetText}
            cursor={cursor}
            typedHistory={typedHistory}
            status={status}
            caretStyle={store.settings.caretStyle}
            fontSize={store.settings.fontSize}
            reducedMotion={store.settings.reducedMotion}
            smoothScroll={store.settings.smoothScroll}
            liveStats={liveStats}
            onCharInput={handleCharInput}
            onBackspace={handleBackspace}
            onBackspaceWord={handleBackspaceWord}
            onRestart={restart}
            onPauseToggle={handlePauseToggle}
          />
        ) : (
          <div className="w-full max-w-4xl bg-[#1E293B] border border-[#334155] rounded-2xl p-8 text-center select-none shadow-md">
            <AlertCircle size={28} className="mx-auto text-[#A78BFA]" />
            <h2 className="mt-3 text-lg font-semibold text-[#F1F5F9]">
              Teks Alkitab Belum Tersedia untuk {currentVerseResult.reference}
            </h2>
            <p className="mt-2 text-sm text-[#94A3B8] max-w-xl mx-auto">
              Aplikasi ini hanya menampilkan teks Alkitab asli yang terverifikasi dan tidak membuat teks tiruan. Terjemahan Alkitab Yang Terbuka (AYT) tersedia lengkap sebanyak 66 kitab dan 31.102 ayat.
            </p>
            <p className="mt-3 text-xs text-[#94A3B8] font-mono">
              Gunakan tombol Sebelumnya / Berikutnya di atas untuk berpindah ayat.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenPassageSelector={() => setShowPassageSelector(true)} />

      {/* Verse Selector Modal */}
      {showPassageSelector && (
        <PassageSelector
          currentBookId={bookId}
          currentChapter={chapter}
          currentStartVerse={verse}
          mode={mode}
          language="AYT"
          onSelect={handlePassageSelect}
          onClose={() => setShowPassageSelector(false)}
        />
      )}

      {/* Saved Verse Entries Modal */}
      {showSavedEntries && (
        <SavedEntriesModal
          entries={store.savedEntries}
          currentReference={currentVerseResult.reference}
          onRefreshEntries={() => setStore(loadStore())}
          onJumpToVerse={handleJumpToVerse}
          onClose={() => setShowSavedEntries(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={store.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Progress & Personal Bests Modal */}
      {showProgress && (
        <ProgressModal
          progress={store.progress}
          activeRun={store.activeRun}
          onResumeRun={() => {
            if (store.activeRun) {
              setMode(store.activeRun.mode);
              setBookId(store.activeRun.bookId);
              setChapter(store.activeRun.chapter);
              setVerse(store.activeRun.startVerse || 1);
              setUnitIndex(store.activeRun.unitIndex);
              setRunningTotals(store.activeRun.runningTotals);
              restart();
            }
          }}
          onClose={() => setShowProgress(false)}
        />
      )}

      {/* Results Summary Modal */}
      {completedStats && (
        <ResultsModal
          unitStats={completedStats}
          cumulativeStats={cumulativeStats}
          mode={mode}
          reference={currentVerseResult.reference}
          hasNextUnit={!nextVersePos.isEnd}
          isBookCompleted={mode === 'book' && isCurrentVerseLastInBook}
          nextBookName={nextBook?.nameId}
          onRetry={() => {
            setCompletedStats(null);
            restart();
          }}
          onContinue={() => {
            executeSaveVerse(completedStats, true);
            setCompletedStats(null);
          }}
          onContinueToNextBook={() => {
            executeSaveVerse(completedStats, false);
            setCompletedStats(null);
            handleContinueToNextBook();
          }}
          onSelectAnotherBook={() => {
            executeSaveVerse(completedStats, false);
            setCompletedStats(null);
            setShowPassageSelector(true);
          }}
          onClose={() => {
            setCompletedStats(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
