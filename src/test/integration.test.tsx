import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Integration & Verse Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders BibleType header, persistent current verse, next verse indicator, and controls', () => {
    render(<App />);

    // Scoped to the heading: the footer also names a Bible translation.
    expect(screen.getByRole('heading', { level: 1, name: /Bible\s*Type/i })).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();

    // Default starting verse: Kidung Agung 1:1
    expect(screen.getByText(/Current verse/i)).toBeInTheDocument();
    expect(screen.getByText(/Kidung Agung 1:1/i)).toBeInTheDocument();
    expect(screen.getByText(/Next verse:/i)).toBeInTheDocument();
    expect(screen.getByText(/Kidung Agung 1:2/i)).toBeInTheDocument();

    // Controls
    expect(screen.getByRole('button', { name: /^Prev$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save & Next/i })).toBeInTheDocument();
    expect(screen.getByText(/^Unsaved$/i)).toBeInTheDocument();
  });

  it('switches Bible translation between Indonesian (AYT) and English (WEB)', () => {
    render(<App />);

    // Click on WEB translation button
    const webButton = screen.getByTitle('World English Bible (English)');
    fireEvent.click(webButton);

    // Should switch reference to English (Song of Solomon 1:1)
    expect(screen.getByText(/Song of Solomon 1:1/i)).toBeInTheDocument();
    expect(screen.getByText(/Song of Solomon 1:2/i)).toBeInTheDocument();
  });

  it('navigates to next verse and previous verse manually', () => {
    render(<App />);

    expect(screen.getByText(/Kidung Agung 1:1/i)).toBeInTheDocument();

    // Click Next button
    const nextBtn = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(nextBtn);

    // Current verse should now be Kidung Agung 1:2
    expect(screen.getByText(/Kidung Agung 1:2/i)).toBeInTheDocument();
    expect(screen.getByText(/Kidung Agung 1:3/i)).toBeInTheDocument();

    // Click Prev button
    const prevBtn = screen.getByRole('button', { name: /^Prev$/i });
    fireEvent.click(prevBtn);

    // Back to Kidung Agung 1:1
    expect(screen.getByText(/Kidung Agung 1:1/i)).toBeInTheDocument();
  });

  it('saves an entry and displays Saved status badge', () => {
    render(<App />);

    // Current verse is unsaved
    expect(screen.getByText(/^Unsaved$/i)).toBeInTheDocument();

    // Click Save & Next
    const saveBtn = screen.getByRole('button', { name: /Save & Next/i });
    fireEvent.click(saveBtn);

    // Advanced to 1:2
    expect(screen.getByText(/Kidung Agung 1:2/i)).toBeInTheDocument();

    // Navigate back to 1:1 to check saved status
    const prevBtn = screen.getByRole('button', { name: /^Prev$/i });
    fireEvent.click(prevBtn);

    // Should now show Saved badge!
    expect(screen.getByText(/^Saved$/i)).toBeInTheDocument();
  });

  it('opens passage selector, chooses book, chapter, verse and updates reference', () => {
    render(<App />);

    const changeBtn = screen.getByText(/\(change\)/i);
    fireEvent.click(changeBtn);

    expect(screen.getByText(/Select Scripture Passage/i)).toBeInTheDocument();

    // Pick Kejadian (Genesis in AYT)
    const kejadianBtn = screen.getByText(/Kejadian/i);
    fireEvent.click(kejadianBtn);

    // Start practice
    const applyBtn = screen.getByText(/Start Practice/i);
    fireEvent.click(applyBtn);

    // Reference updated
    expect(screen.getByText(/Kejadian 1:1/i)).toBeInTheDocument();
  });

  it('opens Settings and toggles controls', () => {
    render(<App />);

    const settingsBtn = screen.getByTitle('Settings');
    fireEvent.click(settingsBtn);

    expect(screen.getByText(/Settings & Preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/Caret Style/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-Continue Behavior/i)).toBeInTheDocument();
  });
});
