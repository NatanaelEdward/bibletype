import { describe, it, expect } from 'vitest';
import { calculateStats, calculateCumulativeStats } from '../utils/statsCalculator';

describe('calculateStats', () => {
  it('handles zero duration and empty session safely without NaN or Infinity', () => {
    const stats = calculateStats({
      totalCharsTyped: 0,
      correctChars: 0,
      incorrectChars: 0,
      uncorrectedErrors: 0,
      elapsedSeconds: 0,
      currentIndex: 0,
      targetLength: 100,
    });

    expect(stats.grossWpm).toBe(0);
    expect(stats.netWpm).toBe(0);
    expect(stats.accuracy).toBe(100);
    expect(stats.completionPercentage).toBe(0);
    expect(Number.isNaN(stats.grossWpm)).toBe(false);
    expect(Number.isNaN(stats.netWpm)).toBe(false);
    expect(Number.isNaN(stats.accuracy)).toBe(false);
  });

  it('calculates gross and net WPM accurately with documented formulas', () => {
    // 300 chars typed in 60 seconds (1 minute), 0 uncorrected errors, 290 correct chars
    // Gross = (300 / 5) / 1 = 60 WPM
    // Net = ((290 / 5) - 0) / 1 = 58 WPM
    // Accuracy = (290 / 300) * 100 = 96.7%
    const stats = calculateStats({
      totalCharsTyped: 300,
      correctChars: 290,
      incorrectChars: 10,
      uncorrectedErrors: 0,
      elapsedSeconds: 60,
      currentIndex: 300,
      targetLength: 300,
    });

    expect(stats.grossWpm).toBe(60);
    expect(stats.netWpm).toBe(58);
    expect(stats.accuracy).toBe(96.7);
    expect(stats.completionPercentage).toBe(100);
  });

  it('subtracts uncorrected errors from net WPM and clamps at zero', () => {
    // 50 chars in 60 seconds, but 20 uncorrected errors
    // Correct words = 30 / 5 = 6. Net words = 6 - 20 = -14 -> clamp to 0
    const stats = calculateStats({
      totalCharsTyped: 50,
      correctChars: 30,
      incorrectChars: 20,
      uncorrectedErrors: 20,
      elapsedSeconds: 60,
      currentIndex: 50,
      targetLength: 100,
    });

    expect(stats.netWpm).toBe(0);
    expect(stats.grossWpm).toBe(10);
    expect(stats.accuracy).toBe(60);
    expect(stats.completionPercentage).toBe(50);
  });

  it('calculates cumulative totals across multi-unit runs correctly', () => {
    const priorTotals = {
      totalChars: 300,
      correctChars: 290,
      totalErrors: 5,
      totalTimeSec: 60,
      unitsCompleted: 1,
    };

    const currentUnitStats = calculateStats({
      totalCharsTyped: 300,
      correctChars: 295,
      incorrectChars: 2,
      uncorrectedErrors: 0,
      elapsedSeconds: 60,
      currentIndex: 300,
      targetLength: 300,
    });

    const cumulative = calculateCumulativeStats(priorTotals, currentUnitStats);

    expect(cumulative.runningTotals.unitsCompleted).toBe(2);
    expect(cumulative.runningTotals.totalChars).toBe(600);
    expect(cumulative.runningTotals.correctChars).toBe(585);
    expect(cumulative.runningTotals.totalErrors).toBe(7);
    expect(cumulative.runningTotals.totalTimeSec).toBe(120);

    // 600 chars in 2 minutes = 60 Gross WPM
    expect(cumulative.cumulativeGrossWpm).toBe(60);
    expect(cumulative.cumulativeAccuracy).toBe(97.5);
  });
});
