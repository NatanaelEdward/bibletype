import React, { useState } from 'react';
import { VerseEntry, updatePreviousVerseEntry } from '../utils/storage';
import { X, Search, Edit3, Check, Calendar, BookOpen, AlertCircle } from 'lucide-react';

interface SavedEntriesModalProps {
  entries: VerseEntry[];
  currentReference: string;
  onRefreshEntries: () => void;
  onJumpToVerse?: (bookId: string, chapter: number, verse: number) => void;
  onClose: () => void;
}

export const SavedEntriesModal: React.FC<SavedEntriesModalProps> = ({
  entries,
  currentReference,
  onRefreshEntries,
  onJumpToVerse,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const filteredEntries = entries.filter(e => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      e.reference.toLowerCase().includes(term) ||
      e.verseText.toLowerCase().includes(term) ||
      (e.typedText && e.typedText.toLowerCase().includes(term))
    );
  });

  const handleStartEdit = (entry: VerseEntry) => {
    setEditingEntryId(entry.id);
    setEditText(entry.verseText);
    setEditError(null);
  };

  const handleSaveEdit = (entryId: string) => {
    if (!editText.trim()) {
      setEditError('Teks ayat tidak boleh kosong.');
      return;
    }

    const res = updatePreviousVerseEntry(entryId, { verseText: editText.trim() });
    if (res.success) {
      setEditingEntryId(null);
      setEditError(null);
      onRefreshEntries();
    } else {
      setEditError(res.error || 'Gagal memperbarui ayat.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl text-[#F1F5F9] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
          <div>
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
              <BookOpen className="text-[#A78BFA]" size={20} />
              <span>Ayat Tersimpan ({entries.length})</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Setiap ayat tersimpan secara independen dengan referensi dan teksnya masing-masing
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

        {/* Search */}
        <div className="pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={16} />
            <input
              type="text"
              placeholder="Cari ayat tersimpan berdasarkan referensi atau teks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#A78BFA]"
            />
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8] bg-[#0F172A] rounded-xl border border-[#334155]">
              {entries.length === 0
                ? 'Belum ada ayat yang tersimpan. Ketik dan simpan ayat untuk mencatat entri Anda!'
                : 'Tidak ada ayat tersimpan yang cocok dengan pencarian Anda.'}
            </div>
          ) : (
            filteredEntries.map(entry => {
              const isCurrent = entry.reference === currentReference;
              const isEditing = editingEntryId === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-[#0F172A] border-[#A78BFA]/60 ring-1 ring-[#A78BFA]/30'
                      : 'bg-[#0F172A] border-[#334155]'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#A78BFA]">{entry.reference}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-[#94A3B8]">
                        {entry.translation}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#A78BFA]/10 text-[#A78BFA] font-semibold">
                          Posisi Membaca Saat Ini
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.wpm !== undefined && (
                        <span className="text-xs text-[#94A3B8]">
                          <strong className="text-[#F1F5F9]">{entry.wpm}</strong> WPM
                        </span>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F1F5F9] transition"
                          title="Edit ayat ini tanpa mengubah posisi membaca Anda saat ini"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body / Content */}
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-[#1E293B] border border-[#334155] rounded-xl text-sm text-[#F1F5F9] focus:outline-hidden focus:border-[#A78BFA]"
                      />
                      {editError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-400">
                          <AlertCircle size={14} />
                          <span>{editError}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEntryId(null)}
                          className="px-3 py-1 bg-[#1E293B] hover:bg-[#334155] text-xs rounded-lg text-[#F1F5F9]"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
                          className="px-3 py-1 bg-[#A78BFA] hover:bg-[#818CF8] text-xs text-[#0F172A] font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                        >
                          <Check size={14} />
                          <span>Simpan Perubahan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#F1F5F9] leading-relaxed mb-2 font-mono">
                      {entry.verseText}
                    </p>
                  )}

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-2 border-t border-[#334155]/40">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Disimpan: {new Date(entry.savedAt).toLocaleString('id-ID')}</span>
                      {entry.updatedAt && <span>(diedit)</span>}
                    </span>
                    {onJumpToVerse && !isCurrent && (
                      <button
                        onClick={() => {
                          onJumpToVerse(entry.bookId, entry.chapter, entry.verse);
                          onClose();
                        }}
                        className="text-[#A78BFA] hover:underline"
                      >
                        Buka ayat ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
