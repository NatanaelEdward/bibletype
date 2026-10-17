/**
 * Character normalization and matching logic for Bible typing.
 * Seamlessly handles typographic characters (curly quotes, dashes) on standard physical keyboards.
 */

export function isCharMatch(typedChar: string, targetChar: string, ignoreCase: boolean = false): boolean {
  if (typedChar === targetChar) return true;

  // Case-insensitive comparison if ignoreCase toggle is enabled
  if (ignoreCase && typedChar.toLowerCase() === targetChar.toLowerCase()) {
    return true;
  }

  // Typographic double quotes: “ ” vs straight "
  if (typedChar === '"' && (targetChar === '“' || targetChar === '”' || targetChar === '"')) {
    return true;
  }

  // Typographic single quotes / apostrophes: ‘ ’ vs straight '
  if (typedChar === "'" && (targetChar === '‘' || targetChar === '’' || targetChar === "'")) {
    return true;
  }

  // Typographic dashes: — (em-dash), – (en-dash), vs straight hyphen -
  if (typedChar === '-' && (targetChar === '—' || targetChar === '–' || targetChar === '-')) {
    return true;
  }

  // Non-breaking space or special whitespace vs regular space
  if ((typedChar === ' ' || typedChar === '\u00A0') && (targetChar === ' ' || targetChar === '\u00A0')) {
    return true;
  }

  return false;
}

/**
 * Normalizes passage text to clean displayable typography while ensuring consistent spacing.
 */
export function normalizeScriptureText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}
