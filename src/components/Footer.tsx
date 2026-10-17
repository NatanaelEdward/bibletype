import React from 'react';
import { BookOpen, Command } from 'lucide-react';

interface FooterProps {
  onOpenPassageSelector: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPassageSelector }) => {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-[#334155]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
      {/* Passage controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPassageSelector}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#818CF8]/50 transition"
        >
          <BookOpen size={14} className="text-[#A78BFA]" />
          <span>Pilih Ayat</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-[#F1F5F9]">Tab</kbd>
          <span>mulai ulang</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-[#F1F5F9]">Esc</kbd>
          <span>jeda</span>
        </span>
        <span className="hidden md:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-[#F1F5F9]">
            <Command size={10} className="inline mr-0.5" />Bksp
          </kbd>
          <span>hapus kata</span>
        </span>
      </div>

      {/* Licensing Attribution — reproduction of the publishers' notices is a licence condition */}
      <div className="text-[10px] text-center sm:text-right space-y-0.5 text-[#94A3B8]">
        <div>
          Alkitab Yang Terbuka (AYT) © 2011–2024{' '}
          <a
            href="https://ayt.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#A78BFA] underline underline-offset-2"
          >
            Yayasan Lembaga SABDA (YLSA)
          </a>{' '}
          — used non-commercially under YLSA&apos;s free usage/distribution grant;
          derivatives CC BY-NC-SA. Permissions: ylsa@sabda.org
        </div>
      </div>
    </footer>
  );
};
