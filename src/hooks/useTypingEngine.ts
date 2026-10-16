import { useState, useEffect, useRef, useCallback } from 'react';
import { isCharMatch } from '../utils/charMatcher';
import { calculateStats } from '../utils/statsCalculator';
import { playKeySound } from '../utils/soundEffects';

export interface UseTypingEngineProps {
  targetText: string;
  soundEnabled: boolean;
  soundVolume: number;
  onComplete?: (stats: ReturnType<typeof calculateStats>) => void;
}

export function useTypingEngine({
  targetText,
  soundEnabled,
  soundVolume,
  onComplete,
}: UseTypingEngineProps) {
  const [cursor, setCursor] = useState(0);
  const [typedHistory, setTypedHistory] = useState<
    Array<{ char: string; targetChar: string; isCorrect: boolean; timestamp: number }>
  >([]);
  const [status, setStatus] = useState<'idle' | 'typing' | 'paused' | 'completed'>('idle');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  // Synchronization refs for instant synchronous handling & rapid keystroke events
  const cursorRef = useRef(0);
  const typedHistoryRef = useRef<Array<{ char: string; targetChar: string; isCorrect: boolean; timestamp: number }>>([]);
  const statusRef = useRef<'idle' | 'typing' | 'paused' | 'completed'>('idle');
  const totalErrorsRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Reset state when targetText changes
  useEffect(() => {
    cursorRef.current = 0;
    typedHistoryRef.current = [];
    statusRef.current = 'idle';
    totalErrorsRef.current = 0;

    setCursor(0);
    setTypedHistory([]);
    setStatus('idle');
    setStartTime(null);
    setElapsedSeconds(0);
    setTotalErrors(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [targetText]);

  // Live timer interval
  useEffect(() => {
    if (status === 'typing') {
      const interval = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 0.2);
      }, 200);
      timerRef.current = interval;
      return () => clearInterval(interval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [status]);

  // Uncorrected and correct char counts
  const uncorrectedErrors = typedHistory.filter(h => !h.isCorrect).length;
  const correctChars = typedHistory.filter(h => h.isCorrect).length;
  const totalCharsTyped = typedHistory.length;

  // Live stats calculation
  const liveStats = calculateStats({
    totalCharsTyped,
    correctChars,
    incorrectChars: totalErrors,
    uncorrectedErrors,
    elapsedSeconds,
    currentIndex: cursor,
    targetLength: targetText.length,
  });

  const handleCharInput = useCallback(
    (inputChar: string) => {
      const currentCursor = cursorRef.current;
      const currentStatus = statusRef.current;

      if (currentStatus === 'completed' || currentCursor >= targetText.length) return;

      const now = Date.now();
      if (currentStatus === 'idle') {
        statusRef.current = 'typing';
        setStatus('typing');
        setStartTime(now);
      }

      const targetChar = targetText[currentCursor];
      const isCorrect = isCharMatch(inputChar, targetChar);

      if (soundEnabled) {
        playKeySound(!isCorrect, soundVolume);
      }

      if (!isCorrect) {
        totalErrorsRef.current += 1;
        setTotalErrors(totalErrorsRef.current);
      }

      const newHistoryItem = {
        char: inputChar,
        targetChar,
        isCorrect,
        timestamp: now,
      };

      const nextCursor = currentCursor + 1;
      const nextHistory = [...typedHistoryRef.current, newHistoryItem];

      cursorRef.current = nextCursor;
      typedHistoryRef.current = nextHistory;

      setCursor(nextCursor);
      setTypedHistory(nextHistory);

      // Check for completion
      if (nextCursor >= targetText.length) {
        statusRef.current = 'completed';
        setStatus('completed');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const finalStats = calculateStats({
          totalCharsTyped: nextHistory.length,
          correctChars: nextHistory.filter(h => h.isCorrect).length,
          incorrectChars: totalErrorsRef.current,
          uncorrectedErrors: nextHistory.filter(h => !h.isCorrect).length,
          elapsedSeconds: Math.max(0.5, elapsedSeconds),
          currentIndex: targetText.length,
          targetLength: targetText.length,
        });

        if (onCompleteRef.current) {
          onCompleteRef.current(finalStats);
        }
      }
    },
    [targetText, soundEnabled, soundVolume, elapsedSeconds]
  );

  const handleBackspace = useCallback(() => {
    const currentCursor = cursorRef.current;
    if (statusRef.current === 'completed' || currentCursor === 0) return;

    const nextCursor = currentCursor - 1;
    const nextHistory = typedHistoryRef.current.slice(0, typedHistoryRef.current.length - 1);

    cursorRef.current = nextCursor;
    typedHistoryRef.current = nextHistory;

    setCursor(nextCursor);
    setTypedHistory(nextHistory);
  }, []);

  const handleBackspaceWord = useCallback(() => {
    const currentCursor = cursorRef.current;
    if (statusRef.current === 'completed' || currentCursor === 0) return;

    // Delete backwards until the previous space or boundary
    let targetIndex = currentCursor - 1;
    while (targetIndex > 0 && targetText[targetIndex] === ' ') {
      targetIndex--;
    }
    while (targetIndex > 0 && targetText[targetIndex - 1] !== ' ') {
      targetIndex--;
    }

    const deleteCount = currentCursor - targetIndex;
    const nextHistory = typedHistoryRef.current.slice(0, typedHistoryRef.current.length - deleteCount);

    cursorRef.current = targetIndex;
    typedHistoryRef.current = nextHistory;

    setCursor(targetIndex);
    setTypedHistory(nextHistory);
  }, [targetText]);

  const restart = useCallback(() => {
    cursorRef.current = 0;
    typedHistoryRef.current = [];
    statusRef.current = 'idle';
    totalErrorsRef.current = 0;

    setCursor(0);
    setTypedHistory([]);
    setStatus('idle');
    setStartTime(null);
    setElapsedSeconds(0);
    setTotalErrors(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current === 'typing') {
      statusRef.current = 'paused';
      setStatus('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current === 'paused') {
      statusRef.current = 'typing';
      setStatus('typing');
    }
  }, []);

  return {
    cursor,
    typedHistory,
    status,
    startTime,
    elapsedSeconds,
    totalErrors,
    liveStats,
    handleCharInput,
    handleBackspace,
    handleBackspaceWord,
    restart,
    pause,
    resume,
  };
}
