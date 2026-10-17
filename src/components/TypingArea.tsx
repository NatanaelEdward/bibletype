import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CaretStyle, FontSize } from '../utils/storage';
import { TypingStats } from '../utils/statsCalculator';

interface TypingAreaProps {
  targetText: string;
  cursor: number;
  typedHistory: Array<{ char: string; targetChar: string; isCorrect: boolean }>;
  status: 'idle' | 'typing' | 'paused' | 'completed';
  caretStyle: CaretStyle;
  fontSize: FontSize;
  reducedMotion: boolean;
  smoothScroll?: boolean;
  liveStats: TypingStats;
  onCharInput: (char: string) => void;
  onBackspace: () => void;
  onBackspaceWord: () => void;
  onRestart: () => void;
  onPauseToggle: () => void;
}

const fontSizeClasses: Record<FontSize, string> = {
  sm: 'text-lg leading-relaxed md:text-xl',
  md: 'text-xl leading-relaxed md:text-2xl md:leading-loose',
  lg: 'text-2xl leading-relaxed md:text-3xl md:leading-loose',
  xl: 'text-3xl leading-relaxed md:text-4xl md:leading-loose',
};

export const TypingArea: React.FC<TypingAreaProps> = ({
  targetText,
  cursor,
  typedHistory,
  status,
  caretStyle,
  fontSize,
  reducedMotion,
  smoothScroll = true,
  liveStats,
  onCharInput,
  onBackspace,
  onBackspaceWord,
  onRestart,
  onPauseToggle,
}) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  // Keep hidden input focused
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  useEffect(() => {
    focusInput();
  }, [targetText]);

  // Scroll active character into the center of the viewport
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const charEl = activeCharRef.current;
      const container = containerRef.current;

      const charRect = charEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if active char is outside the comfortable middle band
      const charRelativeTop = charRect.top - containerRect.top;
      const targetMiddle = container.clientHeight / 2;

      if (Math.abs(charRelativeTop - targetMiddle) > 40) {
        container.scrollTo({
          top: container.scrollTop + (charRelativeTop - targetMiddle),
          behavior: (reducedMotion || !smoothScroll) ? 'auto' : 'smooth',
        });
      }
    }
  }, [cursor, reducedMotion, smoothScroll]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape to toggle pause
    if (e.key === 'Escape') {
      e.preventDefault();
      onPauseToggle();
      return;
    }

    // Tab + Enter or quick shortcuts
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
      return;
    }

    if (status === 'paused') {
      onPauseToggle(); // Any key resumes when paused
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || e.altKey) {
        onBackspaceWord();
      } else {
        onBackspace();
      }
      return;
    }

    // Standard single character inputs
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onCharInput(e.key);
    }
  };

  // Segment target text into words so line wrapping keeps whole words together
  const wordTokens = useMemo(() => {
    const tokens: Array<{
      word: string;
      startIndex: number;
      chars: Array<{ char: string; index: number }>;
    }> = [];
    const regex = /\S+\s*/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(targetText)) !== null) {
      const startIndex = match.index;
      const word = match[0];
      const chars = word.split('').map((char, i) => ({
        char,
        index: startIndex + i,
      }));
      tokens.push({ word, startIndex, chars });
    }
    return tokens;
  }, [targetText]);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto my-auto flex flex-col items-center select-none"
      onClick={focusInput}
    >
      {/* Hidden textarea to capture all keystrokes and IME */}
      <textarea
        ref={inputRef}
        aria-label="Area mengetik teks Alkitab"
        className="absolute -top-9999px left-0 opacity-0 pointer-events-none w-1 h-1 resize-none"
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Focus overlay warning if user clicked away */}
      {!isFocused && status !== 'completed' && (
        <div
          onClick={focusInput}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0F172A]/80 backdrop-blur-xs rounded-xl cursor-pointer transition-opacity"
        >
          <div className="flex items-center gap-2 text-[#A78BFA] text-base font-medium px-4 py-2 rounded-lg bg-[#1E293B] border border-[#334155] shadow-lg">
            <span>Klik atau tekan tombol apa saja untuk fokus</span>
          </div>
        </div>
      )}

      {/* Paused state overlay */}
      {status === 'paused' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0F172A]/90 backdrop-blur-xs rounded-xl">
          <div className="text-center p-6 bg-[#1E293B] border border-[#334155] rounded-xl shadow-xl">
            <h3 className="text-xl font-bold text-[#F1F5F9] mb-2">Sesi Dijeda</h3>
            <p className="text-sm text-[#94A3B8] mb-4">
              Tekan <kbd className="px-2 py-1 bg-[#0F172A] border border-[#334155] rounded text-xs text-[#A78BFA]">Esc</kbd> atau mulai mengetik untuk melanjutkan
            </p>
            <button
              onClick={onRestart}
              className="text-xs px-3 py-1.5 bg-[#334155] hover:bg-[#475569] text-[#F1F5F9] rounded-lg transition"
            >
              Mulai Ulang Unit
            </button>
          </div>
        </div>
      )}

      {/* Live Mini Stats Tracker Bar */}
      <div className="w-full flex items-center justify-between text-xs text-[#94A3B8] px-2 mb-4 font-mono">
        <div className="flex items-center gap-4">
          <span>
            WPM <strong className="text-[#A78BFA] text-sm">{liveStats.netWpm}</strong>
          </span>
          <span>
            ACC <strong className="text-[#F1F5F9] text-sm">{liveStats.accuracy}%</strong>
          </span>
          <span>
            RAW <strong className="text-[#64748B] text-sm">{liveStats.grossWpm}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            {Math.floor(liveStats.elapsedSeconds / 60)}:
            {String(Math.floor(liveStats.elapsedSeconds % 60)).padStart(2, '0')}
          </span>
          <div className="w-24 bg-[#334155] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#818CF8] to-[#A78BFA] h-full transition-all duration-150"
              style={{ width: `${liveStats.completionPercentage}%` }}
            />
          </div>
          <span>{liveStats.completionPercentage}%</span>
        </div>
      </div>

      {/* Windowed / Scrolling Typing Container with Complete-Word Wrapping */}
      <div
        ref={containerRef}
        className={`w-full max-h-[360px] overflow-y-auto typing-scroll-container py-6 px-4 rounded-xl transition-all cursor-text ${fontSizeClasses[fontSize]}`}
      >
        <p className="relative tracking-wide font-normal text-left select-none leading-relaxed">
          {wordTokens.map(token => {
            const isExtraLong = token.word.trim().length > 30;
            return (
              <span
                key={token.startIndex}
                className="inline-block"
                style={{
                  whiteSpace: isExtraLong ? 'normal' : 'nowrap',
                  wordBreak: isExtraLong ? 'break-all' : 'normal',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                }}
              >
                {token.chars.map(({ char, index }) => {
                  const isTyped = index < cursor;
                  const isCurrent = index === cursor;
                  const historyItem = typedHistory[index];
                  const isCorrect = isTyped && historyItem ? historyItem.isCorrect : null;

                  let charColorClass = 'text-[#64748B]'; // default untyped (clean readable muted slate)
                  if (isTyped) {
                    charColorClass = isCorrect
                      ? 'text-[#F1F5F9]' // correctly typed (crisp bright slate)
                      : 'text-[#FCA5A5] bg-[#FCA5A5]/15 rounded-xs'; // error typed (soft readable red)
                  }

                  return (
                    <span
                      key={index}
                      ref={isCurrent ? activeCharRef : null}
                      className={`relative inline-block ${charColorClass} ${char === ' ' ? 'w-[0.55em]' : ''}`}
                    >
                      {/* Active Caret */}
                      {isCurrent && status !== 'completed' && (
                        <span
                          className={`caret-${caretStyle} ${
                            caretStyle === 'line'
                              ? 'h-[1.2em] -left-[1.5px] top-[0.1em]'
                              : caretStyle === 'block'
                              ? 'w-full h-[1.2em] left-0 top-[0.1em]'
                              : 'w-full bottom-0 left-0'
                          }`}
                        />
                      )}
                      {/* Visual representation of spaces with errors or standard text */}
                      {char === ' ' ? (
                        isTyped && !isCorrect ? (
                          <span className="text-[#FCA5A5] font-bold">_</span>
                        ) : (
                          '\u00A0'
                        )
                      ) : (
                        char
                      )}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};
