import React, { useState } from 'react';
import { BIBLE_BOOKS, BookMetadata } from '../data/bibleData';
import { Translation } from '../data/scriptureStore';
import { X, Search } from 'lucide-react';

interface PassageSelectorProps {
  currentBookId: string;
  currentChapter: number;
  currentStartVerse?: number;
  mode: 'single' | 'book' | 'continuous';
  language: Translation;
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
  language,
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
    const name = language === 'WEB' ? book.nameEn : book.nameId;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || book.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalVersesInChapter = selectedBook.chapterVerses[selectedChapter - 1] || 25;

  const handleApply = () => {
    onSelect({
      bookId: selectedBook.id,
      chapter: selectedChapter,
      startVerse: mode === 'continuous' ? selectedStartVerse : 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#24242e] border border-[#3b3c46] rounded-2xl p-6 shadow-2xl text-[#d1d0c5] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b3c46]">
          <div>
            <h2 className="text-lg font-bold text-[#d1d0c5]">
              Select Scripture Passage
            </h2>
            <p className="text-xs text-[#646669] mt-0.5">
              {mode === 'continuous'
                ? 'Choose where your continuous journey starts'
                : mode === 'book'
                ? 'Select book and starting chapter'
                : 'Select passage to practice'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#646669] hover:text-[#d1d0c5] transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Testament Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-[#646669]" size={16} />
              <input
                type="text"
                placeholder="Search book..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1e1e24] border border-[#3b3c46] rounded-xl text-sm text-[#d1d0c5] placeholder-[#646669] focus:outline-hidden focus:border-[#e2b714]"
              />
            </div>
            <div className="flex rounded-xl bg-[#1e1e24] p-1 border border-[#3b3c46]">
              {(['ALL', 'OT', 'NT'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTestamentFilter(f)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    testamentFilter === f
                      ? 'bg-[#e2b714] text-[#1e1e24]'
                      : 'text-[#646669] hover:text-[#d1d0c5]'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'OT' ? 'Old' : 'New'}
                </button>
              ))}
            </div>
          </div>

          {/* Book Grid */}
          <div>
            <span className="text-xs font-semibold text-[#646669] block mb-2">Book</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredBooks.map(book => {
                const isSelected = selectedBook.id === book.id;
                const bookName = language === 'WEB' ? book.nameEn : book.nameId;
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
                        ? 'bg-[#e2b714]/15 border-[#e2b714] text-[#e2b714]'
                        : 'bg-[#1e1e24] border-[#3b3c46] text-[#d1d0c5] hover:border-[#646669]'
                    }`}
                  >
                    <div className="truncate font-semibold">{bookName}</div>
                    <div className="text-[10px] text-[#646669]">{book.totalChapters} ch</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selector */}
          <div>
            <span className="text-xs font-semibold text-[#646669] block mb-2">
              Chapter (1 – {selectedBook.totalChapters})
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
                      ? 'bg-[#e2b714] text-[#1e1e24] border-[#e2b714] font-bold'
                      : 'bg-[#1e1e24] text-[#d1d0c5] border-[#3b3c46] hover:border-[#646669]'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Verse Selector */}
          <div>
            <span className="text-xs font-semibold text-[#646669] block mb-2">
              Verse (1 – {totalVersesInChapter})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {Array.from({ length: totalVersesInChapter }, (_, i) => i + 1).map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedStartVerse(v)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition flex items-center justify-center border ${
                    selectedStartVerse === v
                      ? 'bg-[#e2b714] text-[#1e1e24] border-[#e2b714] font-bold'
                      : 'bg-[#1e1e24] text-[#d1d0c5] border-[#3b3c46] hover:border-[#646669]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Apply */}
        <div className="pt-4 border-t border-[#3b3c46] flex items-center justify-between">
          <div className="text-xs text-[#646669]">
            Selected:{' '}
            <strong className="text-[#e2b714]">
              {language === 'WEB' ? selectedBook.nameEn : selectedBook.nameId} {selectedChapter}:{selectedStartVerse}
            </strong>
          </div>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-[#e2b714] hover:bg-[#f0c422] text-[#1e1e24] font-semibold text-sm transition"
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
};
