import React, { useState } from 'react';
import { BIBLE_BOOKS, BookMetadata } from '../data/bibleData';
import { X, Search } from 'lucide-react';

interface PassageSelectorProps {
  currentBookId: string;
  currentChapter: number;
  currentStartVerse?: number;
  mode: 'single' | 'book' | 'continuous';
  language?: string;
  onSelect: (selection: {
    bookId: string;
    chapter: number;
    startVerse?: number;
    endVerse?: number;
  }) => void;
  onClose: () => void;
}

export const PassageSelector: React.FC<PassageSelectorProps> = ({
  currentBookId,
  currentChapter,
  currentStartVerse,
  mode,
  onSelect,
  onClose,
}) => {
  const [selectedBook, setSelectedBook] = useState<BookMetadata>(
    () => BIBLE_BOOKS.find(b => b.id === currentBookId) || BIBLE_BOOKS[0]
  );
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);
  const [selectedStartVerse, setSelectedStartVerse] = useState<number>(currentStartVerse || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');

  const filteredBooks = BIBLE_BOOKS.filter(book => {
    if (testamentFilter !== 'ALL' && book.testament !== testamentFilter) return false;
    if (!searchQuery) return true;
    const name = book.nameId;
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalVersesInChapter = selectedBook.chapterVerses[selectedChapter - 1] || 1;

  const handleApply = () => {
    // Ensure selected start verse is properly clamped and preserved across all modes
    const validStartVerse = Math.max(1, Math.min(selectedStartVerse, totalVersesInChapter));
    onSelect({
      bookId: selectedBook.id,
      chapter: selectedChapter,
      startVerse: validStartVerse,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl text-[#F1F5F9] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
          <div>
            <h2 className="text-lg font-bold text-[#F1F5F9]">
              Pilih Ayat Alkitab
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {mode === 'continuous'
                ? 'Lanjutkan mengetik dari posisi terakhir yang tersimpan.'
                : mode === 'book'
                ? 'Ketik ayat secara berurutan hingga seluruh kitab selesai.'
                : 'Pilih satu ayat dan mulai mengetik dari ayat tersebut.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition p-1"
            title="Tutup"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Testament Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={16} />
              <input
                type="text"
                placeholder="Cari kitab..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#A78BFA]"
              />
            </div>
            <div className="flex rounded-xl bg-[#0F172A] p-1 border border-[#334155]">
              {(
                [
                  { key: 'ALL', label: 'Semua' },
                  { key: 'OT', label: 'Perjanjian Lama' },
                  { key: 'NT', label: 'Perjanjian Baru' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTestamentFilter(key)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    testamentFilter === key
                      ? 'bg-[#A78BFA] text-[#0F172A]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Book Grid */}
          <div>
            <span className="text-xs font-semibold text-[#94A3B8] block mb-2">Kitab</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredBooks.map(book => {
                const isSelected = selectedBook.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                      setSelectedStartVerse(1);
                    }}
                    className={`px-3 py-2 text-left rounded-xl text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA]'
                        : 'bg-[#0F172A] border-[#334155] text-[#F1F5F9] hover:border-[#818CF8]/50'
                    }`}
                  >
                    <div className="truncate font-semibold">{book.nameId}</div>
                    <div className="text-[10px] text-[#94A3B8]">{book.totalChapters} pasal</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selector */}
          <div>
            <span className="text-xs font-semibold text-[#94A3B8] block mb-2">
              Pasal (1 – {selectedBook.totalChapters})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {Array.from({ length: selectedBook.totalChapters }, (_, i) => i + 1).map(ch => (
                <button
                  key={ch}
                  onClick={() => {
                    setSelectedChapter(ch);
                    setSelectedStartVerse(1);
                  }}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition flex items-center justify-center border ${
                    selectedChapter === ch
                      ? 'bg-[#A78BFA] text-[#0F172A] border-[#A78BFA] font-bold'
                      : 'bg-[#0F172A] text-[#F1F5F9] border-[#334155] hover:border-[#818CF8]/50'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Verse Selector */}
          <div>
            <span className="text-xs font-semibold text-[#94A3B8] block mb-2">
              Ayat (1 – {totalVersesInChapter})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {Array.from({ length: totalVersesInChapter }, (_, i) => i + 1).map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedStartVerse(v)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition flex items-center justify-center border ${
                    selectedStartVerse === v
                      ? 'bg-[#A78BFA] text-[#0F172A] border-[#A78BFA] font-bold'
                      : 'bg-[#0F172A] text-[#F1F5F9] border-[#334155] hover:border-[#818CF8]/50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Apply */}
        <div className="pt-4 border-t border-[#334155] flex items-center justify-between">
          <div className="text-xs text-[#94A3B8]">
            Dipilih:{' '}
            <strong className="text-[#A78BFA]">
              {selectedBook.nameId} {selectedChapter}:{selectedStartVerse}
            </strong>
          </div>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#818CF8] text-[#0F172A] font-semibold text-sm transition shadow-sm"
          >
            Mulai Mengetik
          </button>
        </div>
      </div>
    </div>
  );
};
