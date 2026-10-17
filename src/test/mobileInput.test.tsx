import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '../App';
import { TypingArea } from '../components/TypingArea';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { getVerse } from '../data/scriptureStore';
import { normalizeScriptureText } from '../utils/charMatcher';
import { loadStore } from '../utils/storage';

/**
 * Mobile input regression tests.
 *
 * The typing surface is a custom renderer fed by an invisible textarea. Mobile
 * keyboards commit characters through input events rather than character
 * keydown events, so these tests drive the textarea the way a virtual keyboard
 * does (by changing its value) instead of firing keydown.
 */

interface HarnessProps {
  text: string;
  ignoreCase?: boolean;
}

const Harness: React.FC<HarnessProps> = ({ text, ignoreCase = false }) => {
  const engine = useTypingEngine({
    targetText: text,
    soundEnabled: false,
    ignoreCase,
  });

  return (
    <div>
      <output data-testid="cursor">{engine.cursor}</output>
      <output data-testid="accuracy">{engine.liveStats.accuracy}</output>
      <output data-testid="keystrokes">{engine.sessionTotalKeystrokes}</output>
      <output data-testid="status">{engine.status}</output>
      <TypingArea
        targetText={text}
        cursor={engine.cursor}
        typedHistory={engine.typedHistory}
        status={engine.status}
        caretStyle="line"
        fontSize="md"
        reducedMotion
        liveStats={engine.liveStats}
        onCharInput={engine.handleCharInput}
        onBackspace={engine.handleBackspace}
        onBackspaceWord={engine.handleBackspaceWord}
        onRestart={engine.restart}
        onPauseToggle={() => {
          if (engine.status === 'paused') engine.resume();
          else engine.pause();
        }}
      />
    </div>
  );
};

const getInput = () =>
  screen.getByRole('textbox', { name: 'Area mengetik teks Alkitab' }) as HTMLTextAreaElement;

/** Simulates how a soft keyboard commits text: a new textarea value per edit. */
const commitValue = (input: HTMLTextAreaElement, value: string) => {
  fireEvent.change(input, { target: { value } });
};

const typeText = (input: HTMLTextAreaElement, text: string) => {
  for (const char of text) {
    commitValue(input, input.value + char);
  }
};

describe('Mobile input handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('types characters delivered through input events', () => {
    render(<Harness text="Kasih itu sabar" />);
    const input = getInput();

    typeText(input, 'Kas');

    expect(screen.getByTestId('cursor')).toHaveTextContent('3');
    expect(screen.getByTestId('accuracy')).toHaveTextContent('100');
    expect(screen.getByTestId('status')).toHaveTextContent('typing');
    expect(input.value).toBe('Kas');
  });

  it('processes every character of a single multi-character commit exactly once', () => {
    render(<Harness text="Kasih" />);
    const input = getInput();

    // Predictive keyboards and paste can commit several characters at once.
    commitValue(input, 'Kas');

    expect(screen.getByTestId('cursor')).toHaveTextContent('3');
    expect(screen.getByTestId('keystrokes')).toHaveTextContent('3');
  });

  it('ignores a repeated change event carrying the same value', () => {
    render(<Harness text="Kasih" />);
    const input = getInput();

    commitValue(input, 'K');
    commitValue(input, 'K');

    expect(screen.getByTestId('keystrokes')).toHaveTextContent('1');
    expect(screen.getByTestId('cursor')).toHaveTextContent('1');
  });

  it('deletes characters through input events', () => {
    render(<Harness text="Kasih" />);
    const input = getInput();

    typeText(input, 'Kas');
    commitValue(input, input.value.slice(0, -1));

    expect(screen.getByTestId('cursor')).toHaveTextContent('2');
    expect(input.value).toBe('Ka');
  });

  it('keeps past mistakes in the session accuracy after correcting them', () => {
    render(<Harness text="Kasih" />);
    const input = getInput();

    commitValue(input, 'x');
    expect(screen.getByTestId('accuracy')).toHaveTextContent('0');

    commitValue(input, '');
    typeText(input, 'Kasih');

    // 5 correct keystrokes out of 6 total attempts in the session.
    expect(screen.getByTestId('keystrokes')).toHaveTextContent('6');
    expect(screen.getByTestId('accuracy')).toHaveTextContent('83.3');
    expect(screen.getByTestId('cursor')).toHaveTextContent('5');
  });

  it('keeps case-insensitive evaluation when the setting is on', () => {
    render(<Harness text="Kasih" ignoreCase />);
    const input = getInput();

    typeText(input, 'kasih');

    expect(screen.getByTestId('accuracy')).toHaveTextContent('100');
    expect(screen.getByTestId('status')).toHaveTextContent('completed');
  });

  it('resumes a paused session as soon as the user types', () => {
    render(<Harness text="Kasih" />);
    const input = getInput();

    typeText(input, 'K');
    // Pause through the same handler the Esc key and overlay use.
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.getByTestId('status')).toHaveTextContent('paused');

    typeText(input, 'a');

    expect(screen.getByTestId('status')).toHaveTextContent('typing');
    expect(screen.getByTestId('cursor')).toHaveTextContent('2');
  });

  it('exposes a focusable capture input that is not hidden from assistive tech', () => {
    render(<Harness text="Kasih" />);
    const input = getInput();

    expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    expect(input.disabled).toBe(false);
    expect(input.getAttribute('aria-hidden')).toBeNull();
    // Must stay focusable: no display:none / visibility:hidden utilities.
    expect(input.classList.contains('hidden')).toBe(false);
    expect(input.classList.contains('invisible')).toBe(false);
    expect(input.classList.contains('display-none')).toBe(false);
    expect(input.classList.contains('opacity-0')).toBe(true);
  });

  it('keeps the typing area usable in a narrow mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 667 });
    window.dispatchEvent(new Event('resize'));

    render(<Harness text="Kasih itu sabar" />);
    const input = getInput();

    typeText(input, 'Kas');
    expect(screen.getByTestId('cursor')).toHaveTextContent('3');
    expect(input.value).toBe('Kas');

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
  });
});

describe('Mobile input integrated with saving', () => {
  const verse = getVerse('SNG', 1, 1, 'AYT');
  const verseText = normalizeScriptureText(verse.text);

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('saves the verse typed via input events and advances to the next verse', () => {
    render(<App />);
    const input = getInput();

    typeText(input, verseText);

    const store = loadStore();
    expect(store.savedEntries).toHaveLength(1);
    expect(store.savedEntries[0].reference).toBe('Kidung Agung 1:1');
    expect(store.savedEntries[0].verseText).toBe(verse.text);

    // Immediate auto-continue advances to the following verse.
    expect(screen.getByRole('button', { name: /Kidung Agung 1:2/ })).toBeInTheDocument();
  });

  it('keeps the typed text and the current verse when saving fails', () => {
    render(<App />);
    const input = getInput();

    typeText(input, verseText.slice(0, 5));

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    fireEvent.click(screen.getByRole('button', { name: /Simpan & Lanjut/ }));

    // The failure is surfaced, the verse is unchanged, and the text is intact.
    expect(screen.getByText(/Storage operation failed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kidung Agung 1:1/ })).toBeInTheDocument();
    expect(getInput().value).toBe(verseText.slice(0, 5));
  });
});
