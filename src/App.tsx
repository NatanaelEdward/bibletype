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
  Translation,
  VerseResult,
} from './data/scriptureStore';
import {
  getNextVersePosition,
  getPrevVersePosition,
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
} from 'lucide-react';

export function App() {
  // Persistence store
  const [store, setStore] = useState<BibleTypeStore>(() => loadStore());

  // Practice mode
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

  // Resolve current active verse
  const currentVerseResult: VerseResult = useMemo(() => {
    return getVerse(bookId, chapter, verse, store.settings.language);
  }, [bookId, chapter, verse, store.settings.language]);

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
    return getVerse(nextVersePos.bookId, nextVersePos.chapter, nextVersePos.verse, store.settings.language);
  }, [nextVersePos, store.settings.language]);

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
  }, [nextVersePos]);

  const handlePrevVerse = useCallback(() => {
    if (prevVersePos.isStart) return;
    setBookId(prevVersePos.bookId);
    setChapter(prevVersePos.chapter);
    setVerse(prevVersePos.verse);
    setCompletedStats(null);
    setSaveError(null);
  }, [prevVersePos]);

  // Save current verse entry with data integrity
  const executeSaveVerse = useCallback(
    (stats: TypingStats, shouldAdvance = true): boolean => {
      // Never store a non-verse: without authentic text there is nothing meaningful to save.
      if (!currentVerseResult.textAvailable) {
        setSaveError(
          `No authentic ${store.settings.language} text is bundled for ${currentVerseResult.reference}, so there is nothing to type or save. The app does not generate substitute scripture.`
        );
        return false;
      }

      const saveResult = saveVerseEntry({
        bookId,
        bookName: currentVerseResult.bookName,
        chapter,
        verse,
        reference: currentVerseResult.reference,
        translation: store.settings.language,
        verseText: currentVerseResult.text,
        wpm: stats.netWpm,
        accuracy: stats.accuracy,
      });

      if (!saveResult.success) {
        setSaveError(saveResult.error || 'Failed to save verse entry. Your text and position are intact. Please retry.');
        return false;
      }

      setSaveError(null);
      setSaveSuccessNotice(`Saved ${currentVerseResult.reference}`);
      setTimeout(() => setSaveSuccessNotice(null), 3000);

      // Refresh store with latest saved entries
      setStore(loadStore());

      // Advance only after successful save
      if (shouldAdvance && !nextVersePos.isEnd) {
        setBookId(nextVersePos.bookId);
        setChapter(nextVersePos.chapter);
        setVerse(nextVersePos.verse);
        setUnitIndex(prev => prev + 1);
      }

      return true;
    },
    [bookId, chapter, verse, currentVerseResult, store.settings.language, nextVersePos]
  );

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
        translation: store.settings.language,
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
        executeSaveVerse(stats, true);
      } else {
        // Show summary modal with option to continue and save
        setCompletedStats(stats);
      }
    },
    [
      runningTotals,
      currentVerseResult.reference,
      store.settings.language,
      store.settings.autoContinue,
      mode,
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
    setMode(newMode);
    setUnitIndex(1);
    setRunningTotals({
      totalChars: 0,
      correctChars: 0,
      totalErrors: 0,
      totalTimeSec: 0,
      unitsCompleted: 0,
    });
  };

  // Translation change
  const handleLanguageChange = (lang: Translation) => {
    setStore(prev => ({
      ...prev,
      settings: { ...prev.settings, language: lang },
    }));
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
    restart();
  };

  // Cumulative stats
  const cumulativeStats = useMemo(() => {
    if (mode === 'single') return null;
    return calculateCumulativeStats(runningTotals, liveStats);
  }, [mode, runningTotals, liveStats]);

  // Passage/Verse selection handler
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
    restart();
  };

  // Jump to specific verse from saved entries or bookmarks
  const handleJumpToVerse = (jBookId: string, jChapter: number, jVerse: number) => {
    setBookId(jBookId);
    setChapter(jChapter);
    setVerse(jVerse);
    setCompletedStats(null);
    setSaveError(null);
    restart();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e24] text-[#d1d0c5]">
      {/* Header */}
      <Header
        language={store.settings.language}
        mode={mode}
        savedEntriesCount={store.savedEntries.length}
        onLanguageChange={handleLanguageChange}
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
              Retry Save
            </button>
          </div>
        )}

        {/* Success Save Notice */}
        {saveSuccessNotice && (
          <div className="w-full max-w-4xl mb-3 p-2 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 size={15} />
            <span>{saveSuccessNotice} successfully saved!</span>
          </div>
        )}

        {/* Persistent Bible Reference Bar (Prominently visible while typing) */}
        <div className="w-full max-w-4xl bg-[#24242e] border border-[#3b3c46] rounded-2xl p-4 mb-4 select-none shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Current Reference & Status */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#646669] font-mono">Current verse</span>
                {existingSavedEntry ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} />
                    <span>Saved</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#646669] bg-[#1e1e24] border border-[#3b3c46] px-2 py-0.5 rounded-full">
                    <span>Unsaved</span>
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-[#1e1e24] border border-[#3b3c46] text-[#e2b714] font-semibold">
                  {currentVerseResult.translation}
                </span>
              </div>

              {/* Clickable Large Reference */}
              <div className="flex items-baseline gap-2 mt-1">
                <button
                  onClick={() => setShowPassageSelector(true)}
                  className="text-xl md:text-2xl font-bold text-[#d1d0c5] hover:text-[#e2b714] transition flex items-center gap-2 group"
                  title="Click to jump to another book, chapter, or verse"
                >
                  <span>{currentVerseResult.reference}</span>
                  <span className="text-xs text-[#646669] group-hover:text-[#e2b714] font-normal transition">
                    (change)
                  </span>
                </button>
              </div>

              {/* Next verse indicator */}
              <div className="text-xs text-[#646669] mt-1 font-mono">
                {nextVersePos.isEnd ? (
                  <span className="text-[#e2b714]">Final verse of Revelation (End of Bible)</span>
                ) : (
                  <span>
                    Next verse:{' '}
                    <strong className="text-[#d1d0c5]">
                      {nextVerseResult?.reference}
                    </strong>
                    {nextVerseResult && !nextVerseResult.textAvailable && (
                      <span className="text-[#e2b714]"> — no bundled {nextVerseResult.translation} text</span>
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1e1e24] border border-[#3b3c46] text-xs font-semibold text-[#d1d0c5] hover:border-[#646669] disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Go to previous verse"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              {/* Next Verse Button */}
              <button
                onClick={handleNextVerse}
                disabled={nextVersePos.isEnd}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1e1e24] border border-[#3b3c46] text-xs font-semibold text-[#d1d0c5] hover:border-[#646669] disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Go to next verse"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>

              {/* Save Verse Button */}
              <button
                onClick={() => executeSaveVerse(liveStats, true)}
                disabled={!currentVerseResult.textAvailable}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e2b714] hover:bg-[#f0c422] text-[#1e1e24] text-xs font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  currentVerseResult.textAvailable
                    ? 'Save current verse entry and advance to next verse'
                    : `No authentic ${currentVerseResult.translation} text bundled for this verse`
                }
              >
                <Save size={14} />
                <span>Save & Next</span>
              </button>
            </div>
          </div>

          {/* Quick Resume Link if user browsed away from last saved position */}
          {lastSavedEntry &&
            (lastSavedEntry.bookId !== bookId ||
              lastSavedEntry.chapter !== chapter ||
              lastSavedEntry.verse !== verse) && (
              <div className="mt-3 pt-2.5 border-t border-[#3b3c46]/60 flex items-center justify-between text-xs">
                <span className="text-[#646669]">
                  Last saved verse: <strong className="text-[#d1d0c5]">{lastSavedEntry.reference}</strong>
                </span>
                <button
                  onClick={() =>
                    handleJumpToVerse(
                      lastSavedEntry.bookId,
                      lastSavedEntry.chapter,
                      lastSavedEntry.verse
                    )
                  }
                  className="text-xs text-[#e2b714] hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Resume from last saved position</span>
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
            liveStats={liveStats}
            onCharInput={handleCharInput}
            onBackspace={handleBackspace}
            onBackspaceWord={handleBackspaceWord}
            onRestart={restart}
            onPauseToggle={handlePauseToggle}
          />
        ) : (
          <div className="w-full max-w-4xl bg-[#24242e] border border-[#3b3c46] rounded-2xl p-8 text-center select-none shadow-md">
            <AlertCircle size={28} className="mx-auto text-[#e2b714]" />
            <h2 className="mt-3 text-lg font-semibold text-[#d1d0c5]">
              No {currentVerseResult.translation} text available for {currentVerseResult.reference}
            </h2>
            <p className="mt-2 text-sm text-[#646669] max-w-xl mx-auto">
              This app only types scripture it actually has, so it will not invent or paraphrase a
              verse here. The Indonesian <strong className="text-[#d1d0c5]">AYT</strong> translation
              is bundled in full (66 books, 31,102 verses) — switch to it from the header. The
              English <strong className="text-[#d1d0c5]">WEB</strong> translation currently bundles
              only a small authentic excerpt.
            </p>
            <p className="mt-3 text-xs text-[#646669] font-mono">
              Use Prev / Next above to keep moving through the Bible.
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
          language={store.settings.language}
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

      {/* Results Summary Modal (When auto-continue is set to summary) */}
      {completedStats && (
        <ResultsModal
          unitStats={completedStats}
          cumulativeStats={cumulativeStats}
          mode={mode}
          reference={currentVerseResult.reference}
          hasNextUnit={!nextVersePos.isEnd}
          onRetry={() => {
            setCompletedStats(null);
            restart();
          }}
          onContinue={() => {
            executeSaveVerse(completedStats, true);
            setCompletedStats(null);
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
