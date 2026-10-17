import React, { useEffect, useState } from 'react';
import { TypingStats, RunningTotals } from '../utils/statsCalculator';
import { RotateCcw, ArrowRight, X, BookOpen, Award } from 'lucide-react';
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
  isBookCompleted?: boolean;
  nextBookName?: string | null;
  onRetry: () => void;
  onContinue: () => void;
  onContinueToNextBook?: () => void;
  onSelectAnotherBook?: () => void;
  onClose: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  unitStats,
  cumulativeStats,
  mode,
  reference,
  hasNextUnit,
  isBookCompleted,
  nextBookName,
  onRetry,
  onContinue,
  onContinueToNextBook,
  onSelectAnotherBook,
  onClose,
}) => {
  const [countdown, setCountdown] = useState<number | null>(
    hasNextUnit && !isBookCompleted ? 5 : null
  );

  useEffect(() => {
    // Fire celebratory confetti on high accuracy or completion
    if (unitStats.accuracy >= 95 || isBookCompleted || !hasNextUnit) {
      try {
        confetti({
          particleCount: isBookCompleted ? 100 : 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A78BFA', '#818CF8', '#C7D2FE', '#86EFAC'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [unitStats, hasNextUnit, isBookCompleted]);

  // Optional auto-countdown if next unit is waiting and not book completion
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
      if (isBookCompleted && onContinueToNextBook) {
        onContinueToNextBook();
      } else {
        onContinue();
      }
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
  }, [onContinue, onRetry, onClose, isBookCompleted, onContinueToNextBook]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl text-[#F1F5F9]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F1F5F9] transition"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          {isBookCompleted ? (
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                <Award size={14} />
                Kitab Selesai!
              </span>
              <h2 className="text-xl font-bold text-[#F1F5F9]">{reference}</h2>
              <p className="text-sm text-[#A78BFA]">
                Selamat! Anda telah menyelesaikan seluruh ayat dalam kitab ini.
              </p>
            </div>
          ) : (
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#A78BFA] bg-[#A78BFA]/10 border border-[#A78BFA]/20 px-2.5 py-1 rounded-full">
                Ayat Selesai
              </span>
              <h2 className="text-xl font-bold mt-2 text-[#F1F5F9]">{reference}</h2>
            </div>
          )}
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155] text-center">
            <span className="text-xs text-[#94A3B8] block">WPM Bersih</span>
            <span className="text-2xl font-bold text-[#A78BFA]">{unitStats.netWpm}</span>
          </div>
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155] text-center">
            <span className="text-xs text-[#94A3B8] block">Akurasi</span>
            <span className="text-2xl font-bold text-[#F1F5F9]">{unitStats.accuracy}%</span>
          </div>
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155] text-center">
            <span className="text-xs text-[#94A3B8] block">Waktu</span>
            <span className="text-2xl font-bold text-[#F1F5F9]">{unitStats.elapsedSeconds}s</span>
          </div>
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155] text-center">
            <span className="text-xs text-[#94A3B8] block">Kesalahan</span>
            <span className="text-2xl font-bold text-[#FCA5A5]">{unitStats.incorrectChars}</span>
          </div>
        </div>

        {/* Cumulative Stats for Book/Continuous Mode */}
        {cumulativeStats && mode !== 'single' && (
          <div className="mb-6 p-4 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60">
            <h4 className="text-xs uppercase tracking-wider text-[#94A3B8] mb-2 font-semibold">
              Total Latihan Berjalan ({cumulativeStats.runningTotals.unitsCompleted} Ayat)
            </h4>
            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
              <div>
                <span className="text-xs text-[#94A3B8]">WPM Bersih Kumulatif:</span>{' '}
                <strong className="text-[#A78BFA]">{cumulativeStats.cumulativeNetWpm}</strong>
              </div>
              <div>
                <span className="text-xs text-[#94A3B8]">Akurasi:</span>{' '}
                <strong className="text-[#F1F5F9]">{cumulativeStats.cumulativeAccuracy}%</strong>
              </div>
              <div>
                <span className="text-xs text-[#94A3B8]">Total Waktu:</span>{' '}
                <strong className="text-[#F1F5F9]">
                  {Math.floor(cumulativeStats.runningTotals.totalTimeSec / 60)}m{' '}
                  {cumulativeStats.runningTotals.totalTimeSec % 60}s
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#334155]/50 hover:bg-[#334155] text-[#F1F5F9] text-sm transition"
          >
            <RotateCcw size={16} />
            <span>Ulangi Ayat (Tab)</span>
          </button>

          {isBookCompleted ? (
            <div className="w-full sm:w-auto flex items-center gap-2">
              {onSelectAnotherBook && (
                <button
                  onClick={onSelectAnotherBook}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] hover:border-[#94A3B8] text-[#F1F5F9] text-sm font-medium transition"
                >
                  <BookOpen size={15} />
                  <span>Pilih Kitab Lain</span>
                </button>
              )}
              {nextBookName && onContinueToNextBook && (
                <button
                  onClick={onContinueToNextBook}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] font-semibold text-sm transition shadow-lg"
                >
                  <span>Lanjut ke {nextBookName} (Enter)</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : hasNextUnit ? (
            <button
              onClick={onContinue}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] font-semibold text-sm transition shadow-lg"
            >
              <span>Lanjut {countdown !== null ? `(${countdown}s)` : ''} (Enter)</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] font-semibold text-sm transition shadow-lg"
            >
              <span>Selesai</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
