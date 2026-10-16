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
      <div className="relative w-full max-w-xl bg-[#24242e] border border-[#3b3c46] rounded-2xl p-6 shadow-2xl text-[#d1d0c5] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b3c46]">
          <h2 className="text-lg font-bold text-[#d1d0c5] flex items-center gap-2">
            <Award className="text-[#e2b714]" size={20} />
            <span>Progress & Personal Bests</span>
          </h2>
          <button
            onClick={onClose}
            className="text-[#646669] hover:text-[#d1d0c5] transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Active Saved Run (if exists) */}
          {activeRun && (
            <div className="p-4 rounded-xl bg-[#e2b714]/10 border border-[#e2b714]/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#e2b714] font-semibold block">
                  Active {activeRun.mode.toUpperCase()} Run In Progress
                </span>
                <span className="text-sm font-bold text-[#d1d0c5]">
                  {activeBook?.nameEn || activeRun.bookId} Chapter {activeRun.chapter}
                </span>
                <div className="text-xs text-[#646669] mt-0.5">
                  Completed {activeRun.runningTotals.unitsCompleted} chapters • {activeRun.runningTotals.totalChars} chars typed
                </div>
              </div>
              {onResumeRun && (
                <button
                  onClick={() => {
                    onResumeRun();
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#e2b714] hover:bg-[#f0c422] text-[#1e1e24] font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Play size={14} />
                  <span>Resume</span>
                </button>
              )}
            </div>
          )}

          {/* Personal Bests Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1e1e24] p-3.5 rounded-xl border border-[#3b3c46] text-center">
              <span className="text-xs text-[#646669] block">Best Net WPM</span>
              <span className="text-2xl font-bold text-[#e2b714]">
                {progress.personalBests.highestWpm}
              </span>
            </div>
            <div className="bg-[#1e1e24] p-3.5 rounded-xl border border-[#3b3c46] text-center">
              <span className="text-xs text-[#646669] block">Best Accuracy</span>
              <span className="text-2xl font-bold text-[#d1d0c5]">
                {progress.personalBests.highestAccuracy}%
              </span>
            </div>
            <div className="bg-[#1e1e24] p-3.5 rounded-xl border border-[#3b3c46] text-center">
              <span className="text-xs text-[#646669] block">Passages Done</span>
              <span className="text-2xl font-bold text-[#4ecca3]">
                {completedCount}
              </span>
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#646669] mb-2 flex items-center gap-1.5">
              <Flame size={14} className="text-[#e2b714]" />
              <span>Recent Sessions</span>
            </h3>

            {progress.recentSessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#646669] bg-[#1e1e24] rounded-xl border border-[#3b3c46]">
                No completed sessions yet. Start typing a passage above!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {progress.recentSessions.map(session => (
                  <div
                    key={session.id}
                    className="p-3 bg-[#1e1e24] rounded-xl border border-[#3b3c46] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#d1d0c5] block">
                        {session.reference} ({session.translation})
                      </span>
                      <span className="text-[10px] text-[#646669]">
                        {new Date(session.date).toLocaleDateString()} • {session.mode}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#e2b714] font-bold text-sm block">
                        {session.netWpm} WPM
                      </span>
                      <span className="text-[10px] text-[#646669]">
                        {session.accuracy}% acc • {session.elapsedSeconds}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Passages List */}
          {completedCount > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#646669] mb-2 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#4ecca3]" />
                <span>Completed Scriptures ({completedCount})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(progress.completedPassages).map(([ref, data]) => (
                  <span
                    key={ref}
                    className="text-xs px-2.5 py-1 bg-[#1e1e24] border border-[#3b3c46] rounded-lg text-[#d1d0c5]"
                  >
                    {ref} <strong className="text-[#e2b714] ml-1">{data.bestWpm} WPM</strong>
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
