import React from 'react';
import { BookOpen, Command } from 'lucide-react';

interface FooterProps {
  onOpenPassageSelector: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPassageSelector }) => {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 py-6 border-t border-[#3b3c46]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#646669]">
      {/* Passage controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPassageSelector}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24242e] border border-[#3b3c46] hover:text-[#d1d0c5] hover:border-[#646669] transition"
        >
          <BookOpen size={14} className="text-[#e2b714]" />
          <span>Change Passage</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#24242e] border border-[#3b3c46] text-[#d1d0c5]">Tab</kbd>
          <span>restart unit</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#24242e] border border-[#3b3c46] text-[#d1d0c5]">Esc</kbd>
          <span>pause</span>
        </span>
        <span className="hidden md:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#24242e] border border-[#3b3c46] text-[#d1d0c5]">
            <Command size={10} className="inline mr-0.5" />Bksp
          </kbd>
          <span>del word</span>
        </span>
      </div>

      {/* Licensing Attribution — reproduction of the publishers' notices is a licence condition */}
      <div className="text-[10px] text-center sm:text-right space-y-0.5">
        <div>
          Alkitab Yang Terbuka (AYT) © 2011–2024{' '}
          <a
            href="https://ayt.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e2b714] underline underline-offset-2"
          >
            Yayasan Lembaga SABDA (YLSA)
          </a>{' '}
          — used non-commercially under YLSA&apos;s free usage/distribution grant;
          derivatives CC BY-NC-SA. Permissions: ylsa@sabda.org
        </div>
        <div>
          World English Bible (WEB) — Public Domain
        </div>
      </div>
    </footer>
  );
};
