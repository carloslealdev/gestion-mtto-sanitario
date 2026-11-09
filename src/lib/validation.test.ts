import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateDocument, hasSchema, documentSchemas } from './validation';

const VALID_CALENDAR_DOC = {
  id: '2026-01-05',
  dateKey: '2026-01-05',
  maintenances: [{ id: 'm-1', lineId: 3, lineName: 'Línea Laminado' }],
};

const VALID_SUPPLY_DOC = {
  id: 's-1',
  name: 'Guantes',
  code: 'GUA-01',
  unit: 'par',
};

const VALID_WORKER_DOC = {
  id: '12345678',
  firstName: 'Ana',
  lastName: 'Perez',
  cedula: 'V-12345678',
  fechaIngreso: '2024-01-01T00:00:00.000Z',
  workTeam: 'G1',
  role: 'trabajador-general',
  epps: {
    casco: { id: 'e1', lastRenewal: '', nextRenewal: '', notOwned: true },
    lentes: { id: 'e2', lastRenewal: '', nextRenewal: '', notOwned: true },
    botas: { id: 'e3', lastRenewal: '', nextRenewal: '', notOwned: true },
    auditivo: { id: 'e4', lastRenewal: '', nextRenewal: '', notOwned: true },
    fullFace: { id: 'e5', lastRenewal: '', nextRenewal: '', notOwned: true },
  },
};

describe('validation: Firestore read boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts a valid document without logging', () => {
    const doc = { ...VALID_CALENDAR_DOC };
    const result = validateDocument('calendar', doc);

    expect(result).toBe(doc);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('accepts a valid document with optional fields omitted', () => {
    const result = validateDocument('supplies', { ...VALID_SUPPLY_DOC });
    expect(result).toEqual(VALID_SUPPLY_DOC);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('keeps unknown extra fields from succeeding documents', () => {
    const legacy = { ...VALID_WORKER_DOC, legacyField: 'present' };
    const result = validateDocument('workers', legacy);
    expect(result).toBe(legacy);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('reports an invalid document but still returns it unchanged (never drops data)', () => {
    const broken = {
      id: 'bad-1',
      dateKey: 12345,
      maintenances: 'nope',
    };

    const result = validateDocument('calendar', broken);

    expect(result).toBe(broken);
    expect(console.error).toHaveBeenCalledTimes(1);
    const [tag, entry] = (console.error as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(tag).toBe('[logError]');
    expect(entry.message).toContain('calendar');
    expect(entry.context.collection).toBe('calendar');
    expect(entry.context.documentId).toBe('bad-1');
    expect(entry.context.issues).toContain('dateKey');
    expect(entry.context.issues).toContain('maintenances');
  });

  it('reports a missing required field on a worker document', () => {
    const incomplete = { ...VALID_WORKER_DOC };
    delete (incomplete as Record<string, unknown>).lastName;

    validateDocument('workers', incomplete);

    expect(console.error).toHaveBeenCalledTimes(1);
    const [, entry] = (console.error as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(entry.context.issues).toContain('lastName');
  });

  it('passes unknown collections through silently', () => {
    const doc = { anything: true };
    const result = validateDocument('collections_without_schema', doc);

    expect(result).toBe(doc);
    expect(console.error).not.toHaveBeenCalled();
    expect(hasSchema('collections_without_schema')).toBe(false);
  });

  it('exposes schemas for every collection read through getAllDocuments', () => {
    const expected = [
      'calendar',
      'users',
      'eppTypes',
      'eppRequests',
      'eppReservations',
      'inventory',
      'nightlyTasks',
      'requests',
      'productionLines',
      'supplies',
      'reservations',
      'workers',
    ];
    for (const collection of expected) {
      expect(hasSchema(collection), `missing schema: ${collection}`).toBe(
        true,
      );
    }
    expect(Object.keys(documentSchemas).sort()).toEqual(
      [...expected].sort(),
    );
  });
});
