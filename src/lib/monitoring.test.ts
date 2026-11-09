import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  logError,
  getRecentErrors,
  clearRecentErrors,
} from './monitoring';

describe('monitoring: logError', () => {
  beforeEach(() => {
    clearRecentErrors();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('buffers an Error with message, stack and context', () => {
    const error = new Error('boom');
    const entry = logError(error, { source: 'test' });

    expect(entry.message).toBe('boom');
    expect(entry.stack).toContain('Error: boom');
    expect(entry.context).toEqual({ source: 'test' });
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const stored = getRecentErrors();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(entry);
  });

  it('handles non-Error rejection values without throwing', () => {
    const entry = logError({ weird: true });
    expect(entry.message).toBe('{"weird":true}');

    const stringEntry = logError('plain string');
    expect(stringEntry.message).toBe('plain string');

    const nullEntry = logError(null);
    expect(nullEntry.message).toBe('null');

    expect(getRecentErrors()).toHaveLength(3);
  });

  it('caps the buffer at 20 entries keeping the newest', () => {
    for (let i = 0; i < 25; i++) {
      logError(new Error(`err-${i}`));
    }
    const stored = getRecentErrors();
    expect(stored).toHaveLength(20);
    expect(stored[0].message).toBe('err-5');
    expect(stored[19].message).toBe('err-24');
  });

  it('returns a copy so callers cannot mutate the buffer', () => {
    logError(new Error('kept'));
    const first = getRecentErrors();
    first.pop();
    expect(getRecentErrors()).toHaveLength(1);
  });

  it('reports to console.error with the structured entry', () => {
    logError(new Error('visible'), { source: 'render' });
    expect(console.error).toHaveBeenCalledTimes(1);
    const [tag, entry] = (console.error as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(tag).toBe('[logError]');
    expect(entry.message).toBe('visible');
    expect(entry.context).toEqual({ source: 'render' });
  });

  it('never throws even if console.error is unavailable', () => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {
      throw new Error('console broken');
    });
    expect(() => logError(new Error('x'))).not.toThrow();
    clearRecentErrors();
  });
});
