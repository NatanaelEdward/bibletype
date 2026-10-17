export interface TypingStats {
  grossWpm: number;
  netWpm: number;
  accuracy: number; // 0 to 100
  correctChars: number;
  incorrectChars: number;
  totalCharsTyped: number;
  uncorrectedErrors: number;
  elapsedSeconds: number;
  completionPercentage: number;
}

export interface RunningTotals {
  totalChars: number;
  correctChars: number;
  totalErrors: number;
  totalTimeSec: number;
  unitsCompleted: number;
}

/**
 * Calculates typing statistics based on active session metrics.
 * Safe against zero duration, division by zero, NaN, Infinity, and negative values.
 */
export function calculateStats(params: {
  totalCharsTyped: number;
  correctChars: number;
  incorrectChars: number;
  uncorrectedErrors: number;
  elapsedSeconds: number;
  currentIndex: number;
  targetLength: number;
  sessionTotalKeystrokes?: number;
  sessionCorrectKeystrokes?: number;
}): TypingStats {
  const {
    totalCharsTyped,
    correctChars,
    incorrectChars,
    uncorrectedErrors,
    elapsedSeconds,
    currentIndex,
    targetLength,
    sessionTotalKeystrokes,
    sessionCorrectKeystrokes,
  } = params;

  const safeElapsedSeconds = Math.max(0, elapsedSeconds);
  const minutes = safeElapsedSeconds / 60;

  // Zero-time or empty session safeguards
  let grossWpm = 0;
  let netWpm = 0;

  if (minutes > 0.008 && totalCharsTyped > 0) { // at least ~0.5 sec
    grossWpm = Math.max(0, Math.round((totalCharsTyped / 5) / minutes));
    const netWords = Math.max(0, (correctChars / 5) - uncorrectedErrors);
    netWpm = Math.max(0, Math.round(netWords / minutes));
  }

  // Accuracy calculation: Monkeytype session accuracy model
  // Tracks all historical key attempts throughout the session so corrected errors remain recorded.
  let accuracy = 100;
  if (typeof sessionTotalKeystrokes === 'number' && sessionTotalKeystrokes > 0) {
    const rawAccuracy = ((sessionCorrectKeystrokes ?? 0) / sessionTotalKeystrokes) * 100;
    accuracy = Math.round(Math.max(0, Math.min(100, rawAccuracy)) * 10) / 10;
  } else if (totalCharsTyped > 0) {
    const rawAccuracy = (correctChars / totalCharsTyped) * 100;
    accuracy = Math.round(Math.max(0, Math.min(100, rawAccuracy)) * 10) / 10;
  }

  // Completion percentage
  let completionPercentage = 0;
  if (targetLength > 0) {
    completionPercentage = Math.round(Math.max(0, Math.min(100, (currentIndex / targetLength) * 100)));
  }

  return {
    grossWpm: isFinite(grossWpm) ? grossWpm : 0,
    netWpm: isFinite(netWpm) ? netWpm : 0,
    accuracy: isFinite(accuracy) ? accuracy : 100,
    correctChars,
    incorrectChars,
    totalCharsTyped,
    uncorrectedErrors,
    elapsedSeconds: Math.round(safeElapsedSeconds),
    completionPercentage,
  };
}

/**
 * Aggregates cumulative statistics across a multi-unit Book or Continuous run.
 */
export function calculateCumulativeStats(
  priorTotals: RunningTotals,
  currentUnitStats: TypingStats
): {
  runningTotals: RunningTotals;
  cumulativeGrossWpm: number;
  cumulativeNetWpm: number;
  cumulativeAccuracy: number;
} {
  const totalChars = priorTotals.totalChars + currentUnitStats.totalCharsTyped;
  const correctChars = priorTotals.correctChars + currentUnitStats.correctChars;
  const totalErrors = priorTotals.totalErrors + currentUnitStats.incorrectChars;
  const totalTimeSec = priorTotals.totalTimeSec + currentUnitStats.elapsedSeconds;
  const unitsCompleted = priorTotals.unitsCompleted + 1;

  const minutes = totalTimeSec / 60;
  let cumulativeGrossWpm = 0;
  let cumulativeNetWpm = 0;
  let cumulativeAccuracy = 100;

  if (minutes > 0.008 && totalChars > 0) {
    cumulativeGrossWpm = Math.round((totalChars / 5) / minutes);
    cumulativeNetWpm = Math.max(0, Math.round(((correctChars / 5) - (totalErrors > 0 ? 1 : 0)) / minutes));
    cumulativeAccuracy = Math.round(((correctChars / totalChars) * 100) * 10) / 10;
  }

  return {
    runningTotals: {
      totalChars,
      correctChars,
      totalErrors,
      totalTimeSec,
      unitsCompleted,
    },
    cumulativeGrossWpm: isFinite(cumulativeGrossWpm) ? cumulativeGrossWpm : 0,
    cumulativeNetWpm: isFinite(cumulativeNetWpm) ? cumulativeNetWpm : 0,
    cumulativeAccuracy: isFinite(cumulativeAccuracy) ? cumulativeAccuracy : 100,
  };
}
