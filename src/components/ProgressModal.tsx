import React from 'react';
import { UserProgress, ActiveRunState } from '../utils/storage';
import { X, Award, Flame, CheckCircle, Play } from 'lucide-react';
import { getBookById } from '../data/bibleData';

interface ProgressModalProps {
  progress: UserProgress;
  activeRun: ActiveRunState | null;
  onResumeRun?: () => void;
  onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  progress,
  activeRun,
  onResumeRun,
  onClose,
}) => {
  const completedCount = Object.keys(progress.completedPassages).length;
  const activeBook = activeRun ? getBookById(activeRun.bookId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl text-[#F1F5F9] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
          <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
            <Award className="text-[#A78BFA]" size={20} />
            <span>Progres & Rekor Terbaik</span>
          </h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition p-1"
            title="Tutup"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Active Saved Run (if exists) */}
          {activeRun && (
            <div className="p-4 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#A78BFA] font-semibold block">
                  Latihan {activeRun.mode === 'book' ? 'Per Kitab' : 'Lanjutkan'} Berjalan
                </span>
                <span className="text-sm font-bold text-[#F1F5F9]">
                  {activeBook?.nameId || activeRun.bookId} Pasal {activeRun.chapter}
                </span>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  Selesai {activeRun.runningTotals.unitsCompleted} ayat • {activeRun.runningTotals.totalChars} karakter diketik
                </div>
              </div>
              {onResumeRun && (
                <button
                  onClick={() => {
                    onResumeRun();
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Play size={14} />
                  <span>Lanjutkan</span>
                </button>
              )}
            </div>
          )}

          {/* Personal Bests Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155] text-center">
              <span className="text-xs text-[#94A3B8] block">WPM Bersih Terbaik</span>
              <span className="text-2xl font-bold text-[#A78BFA]">
                {progress.personalBests.highestWpm}
              </span>
            </div>
            <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155] text-center">
              <span className="text-xs text-[#94A3B8] block">Akurasi Terbaik</span>
              <span className="text-2xl font-bold text-[#F1F5F9]">
                {progress.personalBests.highestAccuracy}%
              </span>
            </div>
            <div className="bg-[#0F172A] p-3.5 rounded-xl border border-[#334155] text-center">
              <span className="text-xs text-[#94A3B8] block">Ayat Selesai</span>
              <span className="text-2xl font-bold text-[#86EFAC]">
                {completedCount}
              </span>
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
              <Flame size={14} className="text-[#A78BFA]" />
              <span>Sesi Terbaru</span>
            </h3>

            {progress.recentSessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8] bg-[#0F172A] rounded-xl border border-[#334155]">
                Belum ada sesi yang selesai. Mulai mengetik ayat di atas!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {progress.recentSessions.map(session => {
                  const modeLabel =
                    session.mode === 'book'
                      ? 'Per Kitab'
                      : session.mode === 'continuous'
                      ? 'Lanjutkan'
                      : 'Ayat Pilihan';
                  return (
                    <div
                      key={session.id}
                      className="p-3 bg-[#0F172A] rounded-xl border border-[#334155] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#F1F5F9] block">
                          {session.reference}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(session.date).toLocaleDateString('id-ID')} • {modeLabel}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#A78BFA] font-bold text-sm block">
                          {session.netWpm} WPM
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {session.accuracy}% akurasi • {session.elapsedSeconds}d
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Passages List */}
          {completedCount > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#86EFAC]" />
                <span>Ayat yang Telah Selesai ({completedCount})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(progress.completedPassages).map(([ref, data]) => (
                  <span
                    key={ref}
                    className="text-xs px-2.5 py-1 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F1F5F9]"
                  >
                    {ref} <strong className="text-[#A78BFA] ml-1">{data.bestWpm} WPM</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
