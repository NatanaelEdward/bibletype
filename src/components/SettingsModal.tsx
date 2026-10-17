import React, { useState } from 'react';
import { UserSettings } from '../utils/storage';
import { X, Volume2, VolumeX, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

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
      <div className="relative w-full max-w-lg bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl text-[#F1F5F9] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
          <h2 className="text-lg font-bold text-[#F1F5F9]">Pengaturan</h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition p-1"
            title="Tutup"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Auto-Continue Behavior */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#F1F5F9] block">Lanjut Otomatis</span>
              <span className="text-xs text-[#94A3B8]">Tindakan setelah menyelesaikan ayat</span>
            </div>
            <div className="flex rounded-xl bg-[#0F172A] p-1 border border-[#334155]">
              {(
                [
                  { mode: 'immediate', label: 'Langsung' },
                  { mode: 'summary', label: 'Ringkasan' },
                ] as const
              ).map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ autoContinue: mode })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    settings.autoContinue === mode
                      ? 'bg-[#A78BFA] text-[#0F172A]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Caret Style */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#F1F5F9] block">Gaya Kursor</span>
              <span className="text-xs text-[#94A3B8]">Bentuk visual penunjuk ketikan</span>
            </div>
            <div className="flex rounded-xl bg-[#0F172A] p-1 border border-[#334155]">
              {(
                [
                  { style: 'line', label: 'Garis' },
                  { style: 'block', label: 'Blok' },
                  { style: 'underline', label: 'Bawah' },
                ] as const
              ).map(({ style, label }) => (
                <button
                  key={style}
                  onClick={() => onUpdateSettings({ caretStyle: style })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    settings.caretStyle === style
                      ? 'bg-[#A78BFA] text-[#0F172A]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#F1F5F9] block">Ukuran Huruf</span>
              <span className="text-xs text-[#94A3B8]">Ukuran tampilan teks ayat</span>
            </div>
            <div className="flex rounded-xl bg-[#0F172A] p-1 border border-[#334155]">
              {(
                [
                  { size: 'sm', label: 'Kecil' },
                  { size: 'md', label: 'Sedang' },
                  { size: 'lg', label: 'Besar' },
                  { size: 'xl', label: 'Ekstra' },
                ] as const
              ).map(({ size, label }) => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ fontSize: size })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    settings.fontSize === size
                      ? 'bg-[#A78BFA] text-[#0F172A]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Typing Sound */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#F1F5F9] block">Suara Ketikan</span>
              <span className="text-xs text-[#94A3B8]">Efek suara ketukan tombol via Web Audio</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                settings.soundEnabled
                  ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA]'
                  : 'bg-[#0F172A] border-[#334155] text-[#94A3B8]'
              }`}
            >
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{settings.soundEnabled ? 'Aktif' : 'Nonaktif'}</span>
            </button>
          </div>

          {/* Reduced Motion (Kurangi Motion) */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#F1F5F9] block">Kurangi Motion</span>
              <span className="text-xs text-[#94A3B8]">Kurangi animasi dan gerakan untuk pengalaman mengetik yang lebih nyaman.</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                settings.reducedMotion
                  ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA]'
                  : 'bg-[#0F172A] border-[#334155] text-[#94A3B8]'
              }`}
            >
              {settings.reducedMotion ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Smooth Scroll */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#F1F5F9] block">Smooth Scroll</span>
              <span className="text-xs text-[#94A3B8]">Gunakan perpindahan yang lebih halus saat berpindah ayat.</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ smoothScroll: !settings.smoothScroll })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                settings.smoothScroll
                  ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA]'
                  : 'bg-[#0F172A] border-[#334155] text-[#94A3B8]'
              }`}
            >
              {settings.smoothScroll ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Ignore Capital Letters (Case-Insensitive) */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#F1F5F9] block">Abaikan Huruf Besar/Kecil</span>
              <span className="text-xs text-[#94A3B8]">Ketik tanpa membedakan kapitalisasi huruf</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ignoreCase: !settings.ignoreCase })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                settings.ignoreCase
                  ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA]'
                  : 'bg-[#0F172A] border-[#334155] text-[#94A3B8]'
              }`}
            >
              {settings.ignoreCase ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-3 border-t border-[#334155]">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <AlertTriangle size={15} />
                <span>Reset Semua Progres & Rekor Terbaik</span>
              </button>
            ) : (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl space-y-2">
                <p className="text-xs text-red-200">
                  Apakah Anda yakin? Tindakan ini akan menghapus semua statistik ketikan, ayat yang telah selesai, dan progres latihan Anda secara permanen.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-[#1E293B] rounded-lg text-xs text-[#F1F5F9] hover:bg-[#334155]"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onResetProgress();
                      setShowResetConfirm(false);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Konfirmasi Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Licensing Attribution */}
          <div className="pt-3 border-t border-[#334155] text-[11px] text-[#94A3B8] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#F1F5F9] font-semibold">
              <ShieldCheck size={14} className="text-[#A78BFA]" />
              <span>Informasi Lisensi & Terjemahan</span>
            </div>
            <p>
              <strong>AYT:</strong> Alkitab Terjemahan Terbuka © Yayasan Lembaga SABDA (YLSA) / sabda.org. Digunakan di bawah lisensi CC BY-NC-SA untuk non-komersial.
            </p>
          </div>

          {/* Tentang — creator attribution, deliberately understated */}
          <section
            aria-labelledby="settings-about-heading"
            className="pt-3 border-t border-[#334155] text-[11px] text-[#94A3B8] space-y-1.5"
          >
            <h3
              id="settings-about-heading"
              className="flex items-center gap-1.5 text-[#F1F5F9] font-semibold"
            >
              <Info size={14} className="text-[#A78BFA]" aria-hidden="true" />
              <span>Tentang</span>
            </h3>
            <p>
              <strong className="text-[#F1F5F9] font-medium">Bible Typing Indonesia</strong>
              <span className="text-[#64748B]"> — Minimalist Scripture Typing</span>
            </p>
            <p className="text-[#64748B]">
              Bible Typing Indonesia adalah proyek independen yang dibuat untuk berlatih mengetik sambil membaca Alkitab.
            </p>
            <p className="text-[#64748B]">
              Dibuat oleh <span className="text-[#94A3B8] font-medium">NatanaelE</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
