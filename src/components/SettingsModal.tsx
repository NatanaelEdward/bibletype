import React, { useState } from 'react';
import { UserSettings, FontSize, CaretStyle, AutoContinueMode } from '../utils/storage';
import { X, Volume2, VolumeX, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#24242e] border border-[#3b3c46] rounded-2xl p-6 shadow-2xl text-[#d1d0c5] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b3c46]">
          <h2 className="text-lg font-bold text-[#d1d0c5]">Settings & Preferences</h2>
          <button
            onClick={onClose}
            className="text-[#646669] hover:text-[#d1d0c5] transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Preferred Language */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#d1d0c5] block">Bible Translation</span>
              <span className="text-xs text-[#646669]">English (WEB) or Indonesian (AYT)</span>
            </div>
            <div className="flex rounded-xl bg-[#1e1e24] p-1 border border-[#3b3c46]">
              {(['WEB', 'AYT'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => onUpdateSettings({ language: lang })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    settings.language === lang
                      ? 'bg-[#e2b714] text-[#1e1e24]'
                      : 'text-[#646669] hover:text-[#d1d0c5]'
                  }`}
                >
                  {lang === 'WEB' ? 'English (WEB)' : 'Indonesian (AYT)'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Continue Behavior */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#d1d0c5] block">Auto-Continue Behavior</span>
              <span className="text-xs text-[#646669]">Action after finishing a chapter</span>
            </div>
            <div className="flex rounded-xl bg-[#1e1e24] p-1 border border-[#3b3c46]">
              {(['immediate', 'summary'] as AutoContinueMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ autoContinue: mode })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition capitalize ${
                    settings.autoContinue === mode
                      ? 'bg-[#e2b714] text-[#1e1e24]'
                      : 'text-[#646669] hover:text-[#d1d0c5]'
                  }`}
                >
                  {mode === 'immediate' ? 'Immediate (Default)' : 'Summary Modal'}
                </button>
              ))}
            </div>
          </div>

          {/* Caret Style */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#d1d0c5] block">Caret Style</span>
              <span className="text-xs text-[#646669]">Visual indicator for active key</span>
            </div>
            <div className="flex rounded-xl bg-[#1e1e24] p-1 border border-[#3b3c46]">
              {(['line', 'block', 'underline'] as CaretStyle[]).map(style => (
                <button
                  key={style}
                  onClick={() => onUpdateSettings({ caretStyle: style })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition capitalize ${
                    settings.caretStyle === style
                      ? 'bg-[#e2b714] text-[#1e1e24]'
                      : 'text-[#646669] hover:text-[#d1d0c5]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#d1d0c5] block">Font Size</span>
              <span className="text-xs text-[#646669]">Passage text display size</span>
            </div>
            <div className="flex rounded-xl bg-[#1e1e24] p-1 border border-[#3b3c46]">
              {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ fontSize: size })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition uppercase ${
                    settings.fontSize === size
                      ? 'bg-[#e2b714] text-[#1e1e24]'
                      : 'text-[#646669] hover:text-[#d1d0c5]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Typing Sound */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#d1d0c5] block">Typing Sound (Off by default)</span>
              <span className="text-xs text-[#646669]">Mechanical key clicks via Web Audio</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                settings.soundEnabled
                  ? 'bg-[#e2b714]/15 border-[#e2b714] text-[#e2b714]'
                  : 'bg-[#1e1e24] border-[#3b3c46] text-[#646669]'
              }`}
            >
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{settings.soundEnabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#d1d0c5] block">Reduced Motion</span>
              <span className="text-xs text-[#646669]">Disable caret blinking and smooth scroll</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                settings.reducedMotion
                  ? 'bg-[#e2b714]/15 border-[#e2b714] text-[#e2b714]'
                  : 'bg-[#1e1e24] border-[#3b3c46] text-[#646669]'
              }`}
            >
              {settings.reducedMotion ? 'On' : 'Off'}
            </button>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-3 border-t border-[#3b3c46]">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <AlertTriangle size={15} />
                <span>Reset All Progress & Personal Bests</span>
              </button>
            ) : (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl space-y-2">
                <p className="text-xs text-red-200">
                  Are you sure? This will permanently delete your typing stats, completed passages, and active runs.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-[#24242e] rounded-lg text-xs text-[#d1d0c5] hover:bg-[#3b3c46]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onResetProgress();
                      setShowResetConfirm(false);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Licensing Attribution */}
          <div className="pt-3 border-t border-[#3b3c46] text-[11px] text-[#646669] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#d1d0c5] font-semibold">
              <ShieldCheck size={14} className="text-[#e2b714]" />
              <span>Licensing & Translation Information</span>
            </div>
            <p>
              <strong>WEB:</strong> World English Bible is in the Public Domain.
            </p>
            <p>
              <strong>AYT:</strong> Alkitab Terjemahan Terbuka © Yayasan Lembaga SABDA (YLSA) / sabda.org. Digunakan di bawah lisensi CC BY-SA 4.0 untuk non-komersial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
