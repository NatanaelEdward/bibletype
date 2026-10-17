import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act, within } from '@testing-library/react';
import App from '../App';
import { isCharMatch } from '../utils/charMatcher';
import { calculateStats } from '../utils/statsCalculator';
import { useTypingEngine } from '../hooks/useTypingEngine';
import {
  getBookById,
  getTotalVersesInBook,
  getVerseIndexInBook,
  isLastVerseInBook,
  getNextVersePosition,
  getPrevVersePosition,
} from '../data/bibleData';
import { getVerse } from '../data/scriptureStore';
import { loadStore, saveVerseEntry } from '../utils/storage';

describe('Project Refinements: Bible Typing Indonesia', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Rebranding and Indonesian Localization', () => {
    it('renders Bible Typing Indonesia branding and preserves English slogan', () => {
      render(<App />);
      expect(screen.getByRole('heading', { level: 1, name: /Bible Typing/i })).toBeInTheDocument();
      expect(screen.getByText('Indonesia')).toBeInTheDocument();
      expect(screen.getByText('Minimalist Scripture Typing')).toBeInTheDocument();
    });

    it('renders Indonesian navigation modes: Ayat Pilihan, Per Kitab, Lanjutkan', () => {
      render(<App />);
      expect(screen.getByRole('button', { name: 'Ayat Pilihan' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Per Kitab' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Lanjutkan' })).toBeInTheDocument();
    });

    it('renders Indonesian buttons and labels throughout the main workspace', () => {
      render(<App />);
      expect(screen.getByText('Ayat Saat Ini')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Berikutnya' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Simpan & Lanjut' })).toBeInTheDocument();
      expect(screen.getByText('Belum Tersimpan')).toBeInTheDocument();
    });
  });

  describe('2. Fix Verse Selector Bug (Matius 5:8 and Arbitrary OT/NT Selections)', () => {
    it('exact verse selection Matius 5:8 opens Matius 5:8 directly, not Matius 5:1', () => {
      render(<App />);

      // Click (ganti) to open passage selector
      const changeBtn = screen.getByText(/\(ganti\)/i);
      fireEvent.click(changeBtn);

      expect(screen.getByText('Pilih Ayat Alkitab')).toBeInTheDocument();

      // Filter to Perjanjian Baru
      const ntBtn = screen.getByRole('button', { name: 'Perjanjian Baru' });
      fireEvent.click(ntBtn);

      // Select Matius
      const matiusBtn = screen.getByRole('button', { name: /^Matius/i });
      fireEvent.click(matiusBtn);

      // Select chapter 5 specifically from the chapter list
      const chapterHeading = screen.getByText(/Pasal \(1 –/i);
      const chapterContainer = chapterHeading.parentElement!;
      const chapter5Btn = within(chapterContainer).getByRole('button', { name: '5' });
      fireEvent.click(chapter5Btn);

      // Select verse 8 specifically from the verse list
      const verseHeading = screen.getByText(/Ayat \(1 –/i);
      const verseContainer = verseHeading.parentElement!;
      const verse8Btn = within(verseContainer).getByRole('button', { name: '8' });
      fireEvent.click(verse8Btn);

      // Click Mulai Mengetik
      const submitBtn = screen.getByRole('button', { name: 'Mulai Mengetik' });
      fireEvent.click(submitBtn);

      // Assert active reference, previous verse, and next verse agreement
      expect(screen.getByText(/Matius 5:8/i)).toBeInTheDocument();
      expect(screen.getByText(/Ayat berikutnya:/i)).toBeInTheDocument();
      expect(screen.getByText(/Matius 5:9/i)).toBeInTheDocument();

      // Clicking Sebelumnya must navigate to Matius 5:7
      const prevBtn = screen.getByRole('button', { name: 'Sebelumnya' });
      fireEvent.click(prevBtn);
      expect(screen.getByText(/Matius 5:7/i)).toBeInTheDocument();

      // Clicking Berikutnya must navigate back to Matius 5:8
      const nextBtn = screen.getByRole('button', { name: 'Berikutnya' });
      fireEvent.click(nextBtn);
      expect(screen.getByText(/Matius 5:8/i)).toBeInTheDocument();

      // Check persistent position stored in LocalStorage
      const savedStore = loadStore();
      expect(savedStore.currentPosition).toEqual({
        bookId: 'MAT',
        chapter: 5,
        verse: 8,
      });
    });

    it('arbitrary OT and NT selections preserve exact verse across testaments', () => {
      const selections = [
        { bookId: 'GEN', chapter: 12, verse: 3, expectedRef: 'Kejadian 12:3', prevRef: 'Kejadian 12:2', nextRef: 'Kejadian 12:4' },
        { bookId: 'PSA', chapter: 23, verse: 4, expectedRef: 'Mazmur 23:4', prevRef: 'Mazmur 23:3', nextRef: 'Mazmur 23:5' },
        { bookId: 'ISA', chapter: 40, verse: 31, expectedRef: 'Yesaya 40:31', prevRef: 'Yesaya 40:30', nextRef: 'Yesaya 41:1' },
        { bookId: 'ROM', chapter: 8, verse: 28, expectedRef: 'Roma 8:28', prevRef: 'Roma 8:27', nextRef: 'Roma 8:29' },
        { bookId: 'REV', chapter: 21, verse: 4, expectedRef: 'Wahyu 21:4', prevRef: 'Wahyu 21:3', nextRef: 'Wahyu 21:5' },
      ];

      for (const sel of selections) {
        const verseResult = getVerse(sel.bookId, sel.chapter, sel.verse, 'AYT');
        expect(verseResult.reference).toBe(sel.expectedRef);
        expect(verseResult.textAvailable).toBe(true);
        expect(verseResult.text.length).toBeGreaterThan(0);

        const prevPos = getPrevVersePosition(sel.bookId, sel.chapter, sel.verse);
        const prevResult = getVerse(prevPos.bookId, prevPos.chapter, prevPos.verse, 'AYT');
        expect(prevResult.reference).toBe(sel.prevRef);

        const nextPos = getNextVersePosition(sel.bookId, sel.chapter, sel.verse);
        const nextResult = getVerse(nextPos.bookId, nextPos.chapter, nextPos.verse, 'AYT');
        expect(nextResult.reference).toBe(sel.nextRef);
      }
    });
  });

  describe('3. Toggleable Ignore Capital Letters & Scripture Integrity', () => {
    it('evaluates typing as correct regardless of case when ignoreCase is enabled', () => {
      expect(isCharMatch('a', 'A', true)).toBe(true);
      expect(isCharMatch('k', 'K', true)).toBe(true);
      expect(isCharMatch('A', 'a', true)).toBe(true);
      expect(isCharMatch('Z', 'z', true)).toBe(true);
      expect(isCharMatch('x', 'y', true)).toBe(false);
    });

    it('evaluates typing strictly case-sensitive when ignoreCase is disabled', () => {
      expect(isCharMatch('a', 'A', false)).toBe(false);
      expect(isCharMatch('k', 'K', false)).toBe(false);
      expect(isCharMatch('A', 'a', false)).toBe(false);
      expect(isCharMatch('A', 'A', false)).toBe(true);
      expect(isCharMatch('a', 'a', false)).toBe(true);
    });

    it('allows toggling ignoreCase via typing engine and UI settings', () => {
      const target = 'Pada mulanya Allah menciptakan langit dan bumi.';

      // When ignoreCase = true
      const { result: permissiveEngine } = renderHook(() =>
        useTypingEngine({
          targetText: target,
          soundEnabled: false,
          soundVolume: 0.2,
          ignoreCase: true,
        })
      );

      act(() => {
        permissiveEngine.current.handleCharInput('p'); // 'p' for 'P'
      });
      expect(permissiveEngine.current.typedHistory[0].isCorrect).toBe(true);

      // When ignoreCase = false
      const { result: strictEngine } = renderHook(() =>
        useTypingEngine({
          targetText: target,
          soundEnabled: false,
          soundVolume: 0.2,
          ignoreCase: false,
        })
      );

      act(() => {
        strictEngine.current.handleCharInput('p'); // 'p' for 'P'
      });
      expect(strictEngine.current.typedHistory[0].isCorrect).toBe(false);
      expect(strictEngine.current.liveStats.incorrectChars).toBe(1);
    });

    it('preserves original AYT casing in scripture text and saved records', () => {
      const verse = getVerse('GEN', 1, 1, 'AYT');
      expect(verse.text).toMatch(/^[A-Z]/);
      expect(verse.text).toContain('Allah');

      const saveResult = saveVerseEntry({
        bookId: 'GEN',
        bookName: 'Kejadian',
        chapter: 1,
        verse: 1,
        reference: 'Kejadian 1:1',
        translation: 'AYT',
        verseText: verse.text,
        wpm: 60,
        accuracy: 100,
      });

      expect(saveResult.success).toBe(true);
      const store = loadStore();
      const saved = store.savedEntries.find(e => e.reference === 'Kejadian 1:1');
      expect(saved?.verseText).toBe(verse.text);
      expect(saved?.verseText).toContain('Allah');
    });
  });

  describe('4. Monkeytype Session Accuracy Model (10 Requirements)', () => {
    it('Requirement 1: Correct keystroke gives 100% accuracy', () => {
      const stats = calculateStats({
        totalCharsTyped: 10,
        correctChars: 10,
        incorrectChars: 0,
        uncorrectedErrors: 0,
        elapsedSeconds: 10,
        currentIndex: 10,
        targetLength: 10,
        sessionTotalKeystrokes: 10,
        sessionCorrectKeystrokes: 10,
      });
      expect(stats.accuracy).toBe(100);
    });

    it('Requirement 2: Error keystroke lowers accuracy immediately', () => {
      const stats = calculateStats({
        totalCharsTyped: 10,
        correctChars: 9,
        incorrectChars: 1,
        uncorrectedErrors: 1,
        elapsedSeconds: 10,
        currentIndex: 10,
        targetLength: 10,
        sessionTotalKeystrokes: 10,
        sessionCorrectKeystrokes: 9,
      });
      expect(stats.accuracy).toBe(90);
    });

    it('Requirement 3: Backspace does not reduce session total keystrokes or error count', () => {
      const { result } = renderHook(() =>
        useTypingEngine({
          targetText: 'Kasih itu sabar',
          soundEnabled: false,
        })
      );

      // Type incorrect char 'x'
      act(() => {
        result.current.handleCharInput('x');
      });
      expect(result.current.liveStats.accuracy).toBe(0);
      expect(result.current.liveStats.incorrectChars).toBe(1);

      // Hit Backspace
      act(() => {
        result.current.handleBackspace();
      });

      // Cursor moves back, but error and total keystrokes are still tracked in session
      expect(result.current.cursor).toBe(0);
      expect(result.current.liveStats.accuracy).toBe(0); // 0 correct / 1 total
    });

    it('Requirement 4: Correcting an error with backspace permanently retains the past error in accuracy', () => {
      const { result } = renderHook(() =>
        useTypingEngine({
          targetText: 'kasih',
          soundEnabled: false,
        })
      );

      // Type wrong char 'x'
      act(() => {
        result.current.handleCharInput('x');
      });
      // Backspace
      act(() => {
        result.current.handleBackspace();
      });
      // Type correct char 'k'
      act(() => {
        result.current.handleCharInput('k');
      });

      // Total keystrokes = 2 ('x' and 'k'), correct = 1 ('k')
      // Accuracy = 1 / 2 = 50%
      expect(result.current.cursor).toBe(1);
      expect(result.current.liveStats.accuracy).toBe(50);
    });

    it('Requirement 5: Word backspace preserves session keystrokes and historical errors', () => {
      const { result } = renderHook(() =>
        useTypingEngine({
          targetText: 'kasih itu sabar',
          soundEnabled: false,
        })
      );

      // Type 'k' (correct), 'x' (wrong), 'y' (wrong)
      act(() => {
        result.current.handleCharInput('k');
        result.current.handleCharInput('x');
        result.current.handleCharInput('y');
      });
      expect(result.current.liveStats.accuracy).toBe(33.3); // 1/3 = 33.3%

      // Word Backspace
      act(() => {
        result.current.handleBackspaceWord();
      });

      // Cursor deleted to start of word, but keystrokes and errors stay
      expect(result.current.cursor).toBe(0);
      expect(result.current.liveStats.accuracy).toBe(33.3);
    });

    it('Requirement 6: Accuracy formula (sessionCorrectKeystrokes / sessionTotalKeystrokes) * 100 matches exact math', () => {
      const stats = calculateStats({
        totalCharsTyped: 50,
        correctChars: 45,
        incorrectChars: 5,
        uncorrectedErrors: 0,
        elapsedSeconds: 60,
        currentIndex: 50,
        targetLength: 50,
        sessionTotalKeystrokes: 100,
        sessionCorrectKeystrokes: 92,
      });
      // 92 / 100 = 92%
      expect(stats.accuracy).toBe(92);
    });

    it('Requirement 7: Navigating to next verse preserves session accuracy across units', () => {
      const { result, rerender } = renderHook(
        ({ text }: { text: string }) =>
          useTypingEngine({
            targetText: text,
            soundEnabled: false,
          }),
        { initialProps: { text: 'ayat satu' } }
      );

      // Type wrong char 'z', backspace, type 'a'
      act(() => {
        result.current.handleCharInput('z');
        result.current.handleBackspace();
        result.current.handleCharInput('a');
      });
      expect(result.current.liveStats.accuracy).toBe(50); // 1 / 2

      // Transition to next verse target text
      rerender({ text: 'ayat dua' });

      // Session accuracy must NOT reset to 100% upon targetText change
      expect(result.current.liveStats.accuracy).toBe(50);
    });

    it('Requirement 8: Saving a verse preserves session accuracy', () => {
      const { result } = renderHook(() =>
        useTypingEngine({
          targetText: 'kidung 1',
          soundEnabled: false,
        })
      );

      act(() => {
        result.current.handleCharInput('k');
      });
      expect(result.current.liveStats.accuracy).toBe(100);

      // Execute a save
      saveVerseEntry({
        bookId: 'SNG',
        bookName: 'Kidung Agung',
        chapter: 1,
        verse: 1,
        reference: 'Kidung Agung 1:1',
        translation: 'AYT',
        verseText: 'kidung 1',
        wpm: 50,
        accuracy: result.current.liveStats.accuracy,
      });

      // Session stats remain live and intact
      expect(result.current.liveStats.accuracy).toBe(100);
    });

    it('Requirement 9: Multiple errors accumulate and persist across backspaces and corrections', () => {
      const { result } = renderHook(() =>
        useTypingEngine({
          targetText: 'alkitab',
          soundEnabled: false,
        })
      );

      // 3 wrong keystrokes, each backspaced
      act(() => {
        result.current.handleCharInput('w');
        result.current.handleBackspace();
        result.current.handleCharInput('w');
        result.current.handleBackspace();
        result.current.handleCharInput('w');
        result.current.handleBackspace();
      });

      // Now type correct 'a'
      act(() => {
        result.current.handleCharInput('a');
      });

      // Total keystrokes: 4 ('w', 'w', 'w', 'a'), Correct: 1 ('a') -> Accuracy: 25%
      expect(result.current.liveStats.accuracy).toBe(25);
    });

    it('Requirement 10: Explicit restart resets accuracy back to initial 100%', () => {
      const { result } = renderHook(() =>
        useTypingEngine({
          targetText: 'Alkitab',
          soundEnabled: false,
        })
      );

      act(() => {
        result.current.handleCharInput('x');
      });
      expect(result.current.liveStats.accuracy).toBe(0);

      // Explicit user restart (e.g. Tab pressed)
      act(() => {
        result.current.restart();
      });

      // Reset to fresh initial state
      expect(result.current.liveStats.accuracy).toBe(100);
      expect(result.current.cursor).toBe(0);
      expect(result.current.typedHistory).toHaveLength(0);
    });
  });

  describe('5. Typing Modes (Ayat Pilihan, Per Kitab, Lanjutkan)', () => {
    it('Mode Ayat Pilihan: starts at exact selected verse, advances to next verse on save', () => {
      render(<App />);

      // Switch to Ayat Pilihan
      const modeBtn = screen.getByRole('button', { name: 'Ayat Pilihan' });
      fireEvent.click(modeBtn);

      // Save & Next
      const saveBtn = screen.getByRole('button', { name: 'Simpan & Lanjut' });
      fireEvent.click(saveBtn);

      // Advanced to Kidung Agung 1:2
      expect(screen.getByText(/Kidung Agung 1:2/i)).toBeInTheDocument();
    });

    it('Mode Per Kitab: calculates verified progress and handles book completion', () => {
      const book = getBookById('OBA'); // Obadiah has 1 chapter, 21 verses
      expect(book).toBeDefined();
      const totalVerses = getTotalVersesInBook('OBA');
      expect(totalVerses).toBe(21);

      expect(getVerseIndexInBook('OBA', 1, 1)).toBe(1);
      expect(getVerseIndexInBook('OBA', 1, 21)).toBe(21);
      expect(isLastVerseInBook('OBA', 1, 21)).toBe(true);
      expect(isLastVerseInBook('OBA', 1, 20)).toBe(false);
    });

    it('Mode Lanjutkan: resumes saved position or shows clear Indonesian guidance if empty', () => {
      render(<App />);

      // Switch to Lanjutkan with no prior saves
      const contBtn = screen.getByRole('button', { name: 'Lanjutkan' });
      fireEvent.click(contBtn);

      // Shows prompt when no saves exist
      expect(screen.getByText(/Belum ada posisi tersimpan/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mulai dari Kejadian 1:1' })).toBeInTheDocument();

      // Now save an entry
      saveVerseEntry({
        bookId: 'PSA',
        bookName: 'Mazmur',
        chapter: 23,
        verse: 1,
        reference: 'Mazmur 23:1',
        translation: 'AYT',
        verseText: 'TUHAN adalah gembalaku',
        wpm: 60,
        accuracy: 100,
      });

      // Switch mode to Lanjutkan again
      fireEvent.click(screen.getByRole('button', { name: 'Ayat Pilihan' }));
      fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));

      // Prompt is now replaced, position restored to Mazmur 23:1
      expect(screen.queryByText(/Belum ada posisi tersimpan/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Mazmur 23:1/i)).toBeInTheDocument();
    });
  });

  describe('7. UI Design Refinement: Settings Terminology & Logo', () => {
    it('displays Kurangi Motion and Smooth Scroll with natural Indonesian descriptions', () => {
      render(<App />);

      // Open settings modal
      const settingsBtn = screen.getByRole('button', { name: 'Pengaturan' });
      fireEvent.click(settingsBtn);

      expect(screen.getByText('Kurangi Motion')).toBeInTheDocument();
      expect(
        screen.getByText('Kurangi animasi dan gerakan untuk pengalaman mengetik yang lebih nyaman.')
      ).toBeInTheDocument();

      expect(screen.getByText('Smooth Scroll')).toBeInTheDocument();
      expect(
        screen.getByText('Gunakan perpindahan yang lebih halus saat berpindah ayat.')
      ).toBeInTheDocument();
    });

    it('toggles Kurangi Motion and Smooth Scroll independently in settings', () => {
      render(<App />);

      // Open settings modal
      fireEvent.click(screen.getByRole('button', { name: 'Pengaturan' }));

      // Find the toggle buttons for Kurangi Motion and Smooth Scroll
      const kurangiMotionSection = screen.getByText('Kurangi Motion').closest('div');
      const smoothScrollSection = screen.getByText('Smooth Scroll').closest('div');

      expect(kurangiMotionSection).toBeInTheDocument();
      expect(smoothScrollSection).toBeInTheDocument();

      const motionToggle = within(kurangiMotionSection!.parentElement!).getByRole('button');
      const scrollToggle = within(smoothScrollSection!.parentElement!).getByRole('button');

      // Initially reducedMotion is false -> "Nonaktif", smoothScroll is true -> "Aktif"
      expect(motionToggle).toHaveTextContent('Nonaktif');
      expect(scrollToggle).toHaveTextContent('Aktif');

      // Toggle Kurangi Motion
      fireEvent.click(motionToggle);
      expect(motionToggle).toHaveTextContent('Aktif');
      expect(scrollToggle).toHaveTextContent('Aktif'); // smoothScroll unchanged

      // Toggle Smooth Scroll
      fireEvent.click(scrollToggle);
      expect(scrollToggle).toHaveTextContent('Nonaktif');
      expect(motionToggle).toHaveTextContent('Aktif'); // reducedMotion unchanged
    });

    it('renders the custom BibleTypingLogo with open Bible, cross, and keyboard keycaps', () => {
      render(<App />);
      const logoSvg = screen.getByLabelText('Bible Typing Indonesia Logo');
      expect(logoSvg).toBeInTheDocument();
      expect(logoSvg).toHaveAttribute('viewBox', '0 0 32 32');
    });
  });

  describe('8. Creator Attribution', () => {
    it('shows the creator credit inside an accessible Tentang section in Settings', () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Pengaturan' }));

      const about = screen.getByRole('region', { name: 'Tentang' });
      expect(within(about).getByText('Bible Typing Indonesia')).toBeInTheDocument();
      expect(within(about).getByText(/Minimalist Scripture Typing/)).toBeInTheDocument();
      expect(
        within(about).getByText(
          'Bible Typing Indonesia adalah proyek independen yang dibuat untuk berlatih mengetik sambil membaca Alkitab.'
        )
      ).toBeInTheDocument();
      expect(within(about).getByText(/Dibuat oleh/)).toHaveTextContent('Dibuat oleh NatanaelE');
    });

    it('keeps the creator name out of the header and typing screen', () => {
      render(<App />);
      expect(screen.queryByText('NatanaelE')).not.toBeInTheDocument();
    });
  });
});
