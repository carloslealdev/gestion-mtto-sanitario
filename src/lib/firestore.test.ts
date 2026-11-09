import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getDocs: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock('./firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ type: 'collection' })),
  doc: vi.fn(() => ({ type: 'doc' })),
  query: vi.fn((...args: unknown[]) => args),
  orderBy: vi.fn(),
  getDocs: mocks.getDocs,
  getDoc: mocks.getDoc,
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  runTransaction: vi.fn(),
}));

import { getAllDocuments, getDocument } from './firestore';

function docSnapshot(id: string, data: Record<string, unknown>) {
  return { id, data: () => data, exists: () => true };
}

describe('firestore read boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mocks.getDocs.mockReset();
    mocks.getDoc.mockReset();
  });

  it('keeps injecting the document id and returns valid documents untouched', async () => {
    mocks.getDocs.mockResolvedValue({
      docs: [
        docSnapshot('GUA-01', {
          name: 'Guantes',
          code: 'GUA-01',
          unit: 'par',
          optimalLevel: 10,
        }),
      ],
    });

    const result = await getAllDocuments('supplies');

    expect(result).toEqual([
      {
        id: 'GUA-01',
        name: 'Guantes',
        code: 'GUA-01',
        unit: 'par',
        optimalLevel: 10,
      },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('returns invalid documents too, reporting them instead of dropping them', async () => {
    mocks.getDocs.mockResolvedValue({
      docs: [
        docSnapshot('bad', { name: 'Sin código' }),
        docSnapshot('good', { name: 'ok', code: 'X', unit: 'unidad' }),
      ],
    });

    const result = await getAllDocuments('supplies');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'bad', name: 'Sin código' });
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      '[logError]',
      expect.objectContaining({
        message: expect.stringContaining('supplies'),
      }),
      expect.any(Error),
    );
  });

  it('validates single-document reads and keeps null for missing docs', async () => {
    mocks.getDoc.mockResolvedValue({
      id: '2026-01-05',
      data: () => ({ dateKey: 99, maintenances: 'nope' }),
      exists: () => true,
    });

    const result = await getDocument('calendar', '2026-01-05');

    expect(result).toEqual({ id: '2026-01-05', dateKey: 99, maintenances: 'nope' });
    expect(console.error).toHaveBeenCalledTimes(1);

    mocks.getDoc.mockResolvedValue({ exists: () => false });
    await expect(getDocument('calendar', 'missing')).resolves.toBeNull();
  });
});
