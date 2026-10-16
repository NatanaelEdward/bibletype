import { describe, it, expect } from 'vitest';
import { isCharMatch, normalizeScriptureText } from '../utils/charMatcher';

describe('charMatcher', () => {
  it('correctly matches standard identical characters', () => {
    expect(isCharMatch('a', 'a')).toBe(true);
    expect(isCharMatch('Z', 'Z')).toBe(true);
    expect(isCharMatch(' ', ' ')).toBe(true);
    expect(isCharMatch('.', '.')).toBe(true);
    expect(isCharMatch('a', 'b')).toBe(false);
  });

  it('enforces capitalization strictly', () => {
    expect(isCharMatch('A', 'a')).toBe(false);
    expect(isCharMatch('t', 'T')).toBe(false);
    expect(isCharMatch('G', 'G')).toBe(true);
  });

  it('normalizes typographic curly double quotes to straight quotes', () => {
    expect(isCharMatch('"', '“')).toBe(true);
    expect(isCharMatch('"', '”')).toBe(true);
    expect(isCharMatch('"', '"')).toBe(true);
  });

  it('normalizes typographic curly single quotes/apostrophes to straight apostrophe', () => {
    expect(isCharMatch("'", '‘')).toBe(true);
    expect(isCharMatch("'", '’')).toBe(true);
    expect(isCharMatch("'", "'")).toBe(true);
  });

  it('normalizes typographic dashes to straight hyphen', () => {
    expect(isCharMatch('-', '—')).toBe(true); // em-dash
    expect(isCharMatch('-', '–')).toBe(true); // en-dash
    expect(isCharMatch('-', '-')).toBe(true);
  });

  it('handles spaces and non-breaking spaces seamlessly', () => {
    expect(isCharMatch(' ', '\u00A0')).toBe(true);
    expect(isCharMatch('\u00A0', ' ')).toBe(true);
  });

  it('normalizes text and collapses irregular whitespace cleanly', () => {
    const raw = "In   the beginning,   God  created\n the heavens.";
    expect(normalizeScriptureText(raw)).toBe("In the beginning, God created the heavens.");
  });

  it('handles Indonesian typography and compounds properly', () => {
    expect(isCharMatch('-', '-')).toBe(true); // orang-orang
    expect(isCharMatch('N', 'N')).toBe(true); // Anak-Nya
    expect(isCharMatch('y', 'y')).toBe(true);
    expect(isCharMatch('a', 'a')).toBe(true);
  });
});
