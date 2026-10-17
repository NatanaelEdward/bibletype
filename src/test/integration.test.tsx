import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Integration & Verse Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Bible Typing Indonesia header, persistent current verse, next verse indicator, and controls', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Bible Typing/i })).toBeInTheDocument();
    expect(screen.getByText(/Minimalist Scripture Typing/i)).toBeInTheDocument();

    // Default starting verse: Kidung Agung 1:1
    expect(screen.getByText(/Ayat Saat Ini/i)).toBeInTheDocument();
    expect(screen.getByText(/Kidung Agung 1:1/i)).toBeInTheDocument();
    expect(screen.getByText(/Ayat berikutnya:/i)).toBeInTheDocument();
    expect(screen.getByText(/Kidung Agung 1:2/i)).toBeInTheDocument();

    // Indonesian Controls
    expect(screen.getByRole('button', { name: /^Sebelumnya$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Berikutnya$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan & Lanjut/i })).toBeInTheDocument();
    expect(screen.getByText(/^Belum Tersimpan$/i)).toBeInTheDocument();
  });

  it('navigates to next verse and previous verse manually', () => {
    render(<App />);

    expect(screen.getByText(/Kidung Agung 1:1/i)).toBeInTheDocument();

    // Click Berikutnya button
    const nextBtn = screen.getByRole('button', { name: /^Berikutnya$/i });
    fireEvent.click(nextBtn);

    // Current verse should now be Kidung Agung 1:2
    expect(screen.getByText(/Kidung Agung 1:2/i)).toBeInTheDocument();
    expect(screen.getByText(/Kidung Agung 1:3/i)).toBeInTheDocument();

    // Click Sebelumnya button
    const prevBtn = screen.getByRole('button', { name: /^Sebelumnya$/i });
    fireEvent.click(prevBtn);

    // Back to Kidung Agung 1:1
    expect(screen.getByText(/Kidung Agung 1:1/i)).toBeInTheDocument();
  });

  it('saves an entry and displays Tersimpan status badge', () => {
    render(<App />);

    // Current verse is unsaved
    expect(screen.getByText(/^Belum Tersimpan$/i)).toBeInTheDocument();

    // Click Simpan & Lanjut
    const saveBtn = screen.getByRole('button', { name: /Simpan & Lanjut/i });
    fireEvent.click(saveBtn);

    // Advanced to 1:2
    expect(screen.getByText(/Kidung Agung 1:2/i)).toBeInTheDocument();

    // Navigate back to 1:1 to check saved status
    const prevBtn = screen.getByRole('button', { name: /^Sebelumnya$/i });
    fireEvent.click(prevBtn);

    // Should now show Tersimpan badge!
    expect(screen.getByText(/^Tersimpan$/i)).toBeInTheDocument();
  });

  it('opens passage selector, chooses book, chapter, verse and updates reference', () => {
    render(<App />);

    const changeBtn = screen.getByText(/\(ganti\)/i);
    fireEvent.click(changeBtn);

    expect(screen.getByText(/Pilih Ayat Alkitab/i)).toBeInTheDocument();

    // Pick Kejadian
    const kejadianBtn = screen.getByText(/Kejadian/i);
    fireEvent.click(kejadianBtn);

    // Start practice
    const applyBtn = screen.getByRole('button', { name: /Mulai Mengetik/i });
    fireEvent.click(applyBtn);

    // Reference updated
    expect(screen.getByText(/Kejadian 1:1/i)).toBeInTheDocument();
  });

  it('opens Settings and toggles controls', () => {
    render(<App />);

    const settingsBtn = screen.getByTitle('Pengaturan');
    fireEvent.click(settingsBtn);

    expect(screen.getByRole('heading', { name: /Pengaturan/i })).toBeInTheDocument();
    expect(screen.getByText(/Gaya Kursor/i)).toBeInTheDocument();
    expect(screen.getByText(/Lanjut Otomatis/i)).toBeInTheDocument();
  });
});
