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
      setEditError('Verse content cannot be empty.');
      return;
    }

    const res = updatePreviousVerseEntry(entryId, { verseText: editText.trim() });
    if (res.success) {
      setEditingEntryId(null);
      setEditError(null);
      onRefreshEntries();
    } else {
      setEditError(res.error || 'Failed to update entry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#24242e] border border-[#3b3c46] rounded-2xl p-6 shadow-2xl text-[#d1d0c5] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b3c46]">
          <div>
            <h2 className="text-lg font-bold text-[#d1d0c5] flex items-center gap-2">
              <BookOpen className="text-[#e2b714]" size={20} />
              <span>Saved Verse Entries ({entries.length})</span>
            </h2>
            <p className="text-xs text-[#646669] mt-0.5">
              Each verse is saved independently with its own reference and content
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#646669] hover:text-[#d1d0c5] transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#646669]" size={16} />
            <input
              type="text"
              placeholder="Search saved verses by reference or text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#1e1e24] border border-[#3b3c46] rounded-xl text-sm text-[#d1d0c5] placeholder-[#646669] focus:outline-hidden focus:border-[#e2b714]"
            />
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#646669] bg-[#1e1e24] rounded-xl border border-[#3b3c46]">
              {entries.length === 0
                ? 'No verses saved yet. Complete and save a verse to record your entry!'
                : 'No saved verses match your search.'}
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
                      ? 'bg-[#1e1e24] border-[#e2b714]/60 ring-1 ring-[#e2b714]/30'
                      : 'bg-[#1e1e24] border-[#3b3c46]'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#e2b714]">{entry.reference}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#24242e] border border-[#3b3c46] text-[#646669]">
                        {entry.translation}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#e2b714]/10 text-[#e2b714] font-semibold">
                          Current Reading Position
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.wpm !== undefined && (
                        <span className="text-xs text-[#646669]">
                          <strong className="text-[#d1d0c5]">{entry.wpm}</strong> WPM
                        </span>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 rounded-lg bg-[#24242e] hover:bg-[#3b3c46] text-[#646669] hover:text-[#d1d0c5] transition"
                          title="Edit this previous entry without changing your current reading position"
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
                        className="w-full p-2.5 bg-[#24242e] border border-[#3b3c46] rounded-xl text-sm text-[#d1d0c5] focus:outline-hidden focus:border-[#e2b714]"
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
                          className="px-3 py-1 bg-[#24242e] hover:bg-[#3b3c46] text-xs rounded-lg text-[#d1d0c5]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
                          className="px-3 py-1 bg-[#e2b714] hover:bg-[#f0c422] text-xs text-[#1e1e24] font-semibold rounded-lg flex items-center gap-1"
                        >
                          <Check size={14} />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#d1d0c5] leading-relaxed mb-2 font-mono">
                      {entry.verseText}
                    </p>
                  )}

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-[10px] text-[#646669] pt-2 border-t border-[#3b3c46]/40">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Saved: {new Date(entry.savedAt).toLocaleString()}</span>
                      {entry.updatedAt && <span>(edited)</span>}
                    </span>
                    {onJumpToVerse && !isCurrent && (
                      <button
                        onClick={() => {
                          onJumpToVerse(entry.bookId, entry.chapter, entry.verse);
                          onClose();
                        }}
                        className="text-[#e2b714] hover:underline"
                      >
                        Go to this verse
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
