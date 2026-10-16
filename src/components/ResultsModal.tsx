import React, { useEffect, useState } from 'react';
import { TypingStats, RunningTotals } from '../utils/statsCalculator';
import { RotateCcw, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsModalProps {
  unitStats: TypingStats;
  cumulativeStats?: {
    runningTotals: RunningTotals;
    cumulativeGrossWpm: number;
    cumulativeNetWpm: number;
    cumulativeAccuracy: number;
  } | null;
  mode: 'single' | 'book' | 'continuous';
  reference: string;
  hasNextUnit: boolean;
  onRetry: () => void;
  onContinue: () => void;
  onClose: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  unitStats,
  cumulativeStats,
  mode,
  reference,
  hasNextUnit,
  onRetry,
  onContinue,
  onClose,
}) => {
  const [countdown, setCountdown] = useState<number | null>(hasNextUnit ? 5 : null);

  useEffect(() => {
    // Fire celebratory confetti on high accuracy or run completion
    if (unitStats.accuracy >= 95 || !hasNextUnit) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#e2b714', '#4ecca3', '#d1d0c5'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [unitStats, hasNextUnit]);

  // Optional auto-countdown if next unit is waiting
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        onContinue();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, onContinue]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onContinue();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onRetry();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onContinue, onRetry, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#24242e] border border-[#3b3c46] rounded-2xl p-6 shadow-2xl text-[#d1d0c5]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#646669] hover:text-[#d1d0c5] transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#e2b714] bg-[#e2b714]/10 px-2.5 py-1 rounded-full">
            Unit Completed
          </span>
          <h2 className="text-xl font-bold mt-2 text-[#d1d0c5]">{reference}</h2>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1e1e24] p-3.5 rounded-xl border border-[#3b3c46]/60 text-center">
            <span className="text-xs text-[#646669] block">Net WPM</span>
            <span className="text-2xl font-bold text-[#e2b714]">{unitStats.netWpm}</span>
          </div>
          <div className="bg-[#1e1e24] p-3.5 rounded-xl border border-[#3b3c46]/60 text-center">
            <span className="text-xs text-[#646669] block">Accuracy</span>
            <span className="text-2xl font-bold text-[#d1d0c5]">{unitStats.accuracy}%</span>
          </div>
          <div className="bg-[#1e1e24] p-3.5 rounded-xl border border-[#3b3c46]/60 text-center">
            <span className="text-xs text-[#646669] block">Time</span>
            <span className="text-2xl font-bold text-[#d1d0c5]">{unitStats.elapsedSeconds}s</span>
          </div>
          <div className="bg-[#1e1e24] p-3.5 rounded-xl border border-[#3b3c46]/60 text-center">
            <span className="text-xs text-[#646669] block">Errors</span>
            <span className="text-2xl font-bold text-[#ca4754]">{unitStats.incorrectChars}</span>
          </div>
        </div>

        {/* Cumulative Stats for Book/Continuous Mode */}
        {cumulativeStats && mode !== 'single' && (
          <div className="mb-6 p-4 rounded-xl bg-[#1e1e24]/70 border border-[#3b3c46]/40">
            <h4 className="text-xs uppercase tracking-wider text-[#646669] mb-2 font-semibold">
              Run Running Totals ({cumulativeStats.runningTotals.unitsCompleted} Units)
            </h4>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-xs text-[#646669]">Cumulative Net WPM:</span>{' '}
                <strong className="text-[#e2b714]">{cumulativeStats.cumulativeNetWpm}</strong>
              </div>
              <div>
                <span className="text-xs text-[#646669]">Accuracy:</span>{' '}
                <strong className="text-[#d1d0c5]">{cumulativeStats.cumulativeAccuracy}%</strong>
              </div>
              <div>
                <span className="text-xs text-[#646669]">Total Time:</span>{' '}
                <strong className="text-[#d1d0c5]">
                  {Math.floor(cumulativeStats.runningTotals.totalTimeSec / 60)}m{' '}
                  {cumulativeStats.runningTotals.totalTimeSec % 60}s
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b3c46]/50 hover:bg-[#3b3c46] text-[#d1d0c5] text-sm transition"
          >
            <RotateCcw size={16} />
            <span>Retry Unit (Tab)</span>
          </button>

          {hasNextUnit ? (
            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e2b714] hover:bg-[#f0c422] text-[#1e1e24] font-semibold text-sm transition shadow-lg"
            >
              <span>Continue {countdown !== null ? `(${countdown}s)` : ''} (Enter)</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e2b714] hover:bg-[#f0c422] text-[#1e1e24] font-semibold text-sm transition shadow-lg"
            >
              <span>Finish Run</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
