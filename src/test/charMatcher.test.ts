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

  it('evaluates characters case-insensitively when ignoreCase is enabled', () => {
    // Uppercase target, lowercase typed (e.g. at start of verse: 'Tuhan' vs 'tuhan')
    expect(isCharMatch('t', 'T', true)).toBe(true);
    expect(isCharMatch('T', 't', true)).toBe(true);
    // Lowercase target, uppercase typed
    expect(isCharMatch('A', 'a', true)).toBe(true);
    expect(isCharMatch('a', 'A', true)).toBe(true);
    // Middle of verse or word (e.g. 'Allah', 'TUHAN', 'orang-orang')
    expect(isCharMatch('l', 'L', true)).toBe(true);
    expect(isCharMatch('L', 'l', true)).toBe(true);
    expect(isCharMatch('h', 'H', true)).toBe(true);
    // Different characters must still fail
    expect(isCharMatch('x', 'T', true)).toBe(false);
    expect(isCharMatch('a', 'b', true)).toBe(false);
  });

  it('evaluates characters strictly case-sensitive when ignoreCase is disabled', () => {
    expect(isCharMatch('t', 'T', false)).toBe(false);
    expect(isCharMatch('T', 't', false)).toBe(false);
    expect(isCharMatch('A', 'a', false)).toBe(false);
    expect(isCharMatch('T', 'T', false)).toBe(true);
    expect(isCharMatch('t', 't', false)).toBe(true);
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
