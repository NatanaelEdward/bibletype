import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypingEngine } from '../hooks/useTypingEngine';

describe('useTypingEngine', () => {
  it('initializes in idle state at cursor 0', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        targetText: 'In the beginning',
        soundEnabled: false,
        soundVolume: 0.2,
      })
    );

    expect(result.current.cursor).toBe(0);
    expect(result.current.status).toBe('idle');
    expect(result.current.typedHistory).toHaveLength(0);
    expect(result.current.totalErrors).toBe(0);
  });

  it('advances caret on correct character input', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        targetText: 'God created',
        soundEnabled: false,
        soundVolume: 0.2,
      })
    );

    act(() => {
      result.current.handleCharInput('G');
    });

    expect(result.current.cursor).toBe(1);
    expect(result.current.status).toBe('typing');
    expect(result.current.typedHistory[0].isCorrect).toBe(true);
    expect(result.current.totalErrors).toBe(0);
  });

  it('tracks incorrect character input and counts errors', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        targetText: 'God created',
        soundEnabled: false,
        soundVolume: 0.2,
      })
    );

    act(() => {
      result.current.handleCharInput('x'); // Wrong key
    });

    expect(result.current.cursor).toBe(1);
    expect(result.current.typedHistory[0].isCorrect).toBe(false);
    expect(result.current.totalErrors).toBe(1);
  });

  it('restores state correctly on backspace', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        targetText: 'Love is patient',
        soundEnabled: false,
        soundVolume: 0.2,
      })
    );

    act(() => {
      result.current.handleCharInput('L');
      result.current.handleCharInput('o');
    });

    expect(result.current.cursor).toBe(2);

    act(() => {
      result.current.handleBackspace();
    });

    expect(result.current.cursor).toBe(1);
    expect(result.current.typedHistory).toHaveLength(1);
  });

  it('deletes an entire word on handleBackspaceWord', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        targetText: 'Love is kind',
        soundEnabled: false,
        soundVolume: 0.2,
      })
    );

    act(() => {
      // Type 'Love '
      'Love '.split('').forEach(ch => result.current.handleCharInput(ch));
    });

    expect(result.current.cursor).toBe(5);

    act(() => {
      result.current.handleBackspaceWord();
    });

    // Should back up before 'Love'
    expect(result.current.cursor).toBe(0);
  });

  it('clears state on restart without leaking old session data', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        targetText: 'Testing restart',
        soundEnabled: false,
        soundVolume: 0.2,
      })
    );

    act(() => {
      result.current.handleCharInput('T');
      result.current.handleCharInput('e');
    });

    expect(result.current.cursor).toBe(2);

    act(() => {
      result.current.restart();
    });

    expect(result.current.cursor).toBe(0);
    expect(result.current.status).toBe('idle');
    expect(result.current.typedHistory).toHaveLength(0);
    expect(result.current.totalErrors).toBe(0);
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it('triggers onComplete callback when reaching the end of target text', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTypingEngine({
        targetText: 'Amen',
        soundEnabled: false,
        soundVolume: 0.2,
        onComplete,
      })
    );

    act(() => {
      'Amen'.split('').forEach(ch => result.current.handleCharInput(ch));
    });

    expect(result.current.status).toBe('completed');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
