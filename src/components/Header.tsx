import React from 'react';
import { Settings, BarChart2, BookmarkCheck } from 'lucide-react';
import { BibleTypingLogo } from './BibleTypingLogo';

interface HeaderProps {
  language?: string;
  mode: 'single' | 'book' | 'continuous';
  savedEntriesCount?: number;
  onLanguageChange?: (lang: any) => void;
  onModeChange: (mode: 'single' | 'book' | 'continuous') => void;
  onOpenSettings: () => void;
  onOpenProgress: () => void;
  onOpenSavedEntries?: () => void;
}

const MODES: Array<{ id: 'single' | 'book' | 'continuous'; label: string }> = [
  { id: 'single', label: 'Ayat Pilihan' },
  { id: 'book', label: 'Per Kitab' },
  { id: 'continuous', label: 'Lanjutkan' },
];

export const Header: React.FC<HeaderProps> = ({
  mode,
  savedEntriesCount,
  onModeChange,
  onOpenSettings,
  onOpenProgress,
  onOpenSavedEntries,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#334155]/60">
      {/* Wordmark Logo */}
      <div className="flex items-center gap-3 select-none">
        <BibleTypingLogo badge size={22} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
            Bible Typing <span className="text-[#A78BFA]">Indonesia</span>
          </h1>
          <p className="text-[10px] text-[#94A3B8] -mt-0.5 font-mono">Minimalist Scripture Typing</p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center bg-[#1E293B] p-1 rounded-xl border border-[#334155]">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === m.id
                ? 'bg-[#A78BFA] text-[#0F172A] shadow-xs'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Right Controls: Stats, Saved Entries, Settings */}
      <div className="flex items-center gap-2">
        {/* Saved Entries Modal Toggle */}
        {onOpenSavedEntries && (
          <button
            onClick={onOpenSavedEntries}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-[#A78BFA] hover:border-[#818CF8]/50 transition text-xs font-semibold"
            aria-label="Lihat Ayat Tersimpan"
            title="Ayat Tersimpan"
          >
            <BookmarkCheck size={16} className="text-[#A78BFA]" />
            <span>{savedEntriesCount ?? 0}</span>
          </button>
        )}

        {/* Progress & Stats Modal Toggle */}
        <button
          onClick={onOpenProgress}
          className="p-2 rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#818CF8]/50 transition"
          aria-label="Lihat Progres"
          title="Progres & Rekor Terbaik"
        >
          <BarChart2 size={18} />
        </button>

        {/* Settings Modal Toggle */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#818CF8]/50 transition"
          aria-label="Pengaturan"
          title="Pengaturan"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
