import React from 'react';
import { Translation } from '../data/scriptureStore';
import { BookOpen, Settings, BarChart2, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  language: Translation;
  mode: 'single' | 'book' | 'continuous';
  savedEntriesCount?: number;
  onLanguageChange: (lang: Translation) => void;
  onModeChange: (mode: 'single' | 'book' | 'continuous') => void;
  onOpenSettings: () => void;
  onOpenProgress: () => void;
  onOpenSavedEntries?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  mode,
  savedEntriesCount,
  onLanguageChange,
  onModeChange,
  onOpenSettings,
  onOpenProgress,
  onOpenSavedEntries,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#3b3c46]/40">
      {/* Wordmark Logo */}
      <div className="flex items-center gap-3 select-none">
        <div className="w-8 h-8 rounded-lg bg-[#e2b714] flex items-center justify-center text-[#1e1e24] shadow-md">
          <BookOpen size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#d1d0c5]">
            Bible<span className="text-[#e2b714]">Type</span>
          </h1>
          <p className="text-[10px] text-[#646669] -mt-1 font-mono">minimalist scripture typing</p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center bg-[#24242e] p-1 rounded-xl border border-[#3b3c46]">
        {(['single', 'book', 'continuous'] as const).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
              mode === m
                ? 'bg-[#e2b714] text-[#1e1e24] shadow-xs'
                : 'text-[#646669] hover:text-[#d1d0c5]'
            }`}
          >
            {m === 'continuous' ? 'Continuous (End)' : m}
          </button>
        ))}
      </div>

      {/* Right Controls: Translation Pill, Stats, Settings */}
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="flex rounded-xl bg-[#24242e] p-1 border border-[#3b3c46]">
          {(['WEB', 'AYT'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                language === lang
                  ? 'bg-[#3b3c46] text-[#e2b714]'
                  : 'text-[#646669] hover:text-[#d1d0c5]'
              }`}
              title={lang === 'WEB' ? 'World English Bible (English)' : 'Alkitab Yang Terbuka (Indonesian)'}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Saved Entries Modal Toggle */}
        {onOpenSavedEntries && (
          <button
            onClick={onOpenSavedEntries}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#24242e] border border-[#3b3c46] text-[#646669] hover:text-[#e2b714] hover:border-[#646669] transition text-xs font-semibold"
            aria-label="View Saved Verse Entries"
            title="Saved Verse Entries"
          >
            <BookmarkCheck size={16} className="text-[#e2b714]" />
            <span>{savedEntriesCount ?? 0}</span>
          </button>
        )}

        {/* Progress & Stats Modal Toggle */}
        <button
          onClick={onOpenProgress}
          className="p-2 rounded-xl bg-[#24242e] border border-[#3b3c46] text-[#646669] hover:text-[#d1d0c5] hover:border-[#646669] transition"
          aria-label="View Progress"
          title="Progress & Personal Bests"
        >
          <BarChart2 size={18} />
        </button>

        {/* Settings Modal Toggle */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-[#24242e] border border-[#3b3c46] text-[#646669] hover:text-[#d1d0c5] hover:border-[#646669] transition"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
