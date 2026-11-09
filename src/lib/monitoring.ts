// Central observability funnel: every unexpected error in the app goes through
// logError, which always writes to the console and keeps a bounded in-memory
// buffer (useful for support: a user can be asked to report what happened) and,
// when the project is configured with VITE_FIREBASE_MEASUREMENT_ID, reports the
// error as a Firebase Analytics `exception` event.

export interface ErrorLogEntry {
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, string>;
}

const MAX_ENTRIES = 20;
const recentErrors: ErrorLogEntry[] = [];

function describe(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}

function reportToFirebase(entry: ErrorLogEntry): void {
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as
    | string
    | undefined;
  if (!measurementId) return;

  void (async () => {
    try {
      const [{ getAnalytics, isSupported, logEvent }, { app }] =
        await Promise.all([import('firebase/analytics'), import('./firebase')]);
      if (!(await isSupported())) return;
      logEvent(getAnalytics(app), 'exception', {
        fatal: false,
        description: entry.message.slice(0, 150),
      });
    } catch {
      // Observability must never break the app.
    }
  })();
}

export function logError(
  error: unknown,
  context?: Record<string, string>,
): ErrorLogEntry {
  const { message, stack } = describe(error);
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    message,
    ...(stack ? { stack } : {}),
    ...(context ? { context } : {}),
  };

  recentErrors.push(entry);
  if (recentErrors.length > MAX_ENTRIES) {
    recentErrors.splice(0, recentErrors.length - MAX_ENTRIES);
  }

  try {
    console.error('[logError]', entry, error);
  } catch {
    // A broken console must not take the app down.
  }

  reportToFirebase(entry);
  return entry;
}

export function getRecentErrors(): ErrorLogEntry[] {
  return [...recentErrors];
}

export function clearRecentErrors(): void {
  recentErrors.length = 0;
}

export function installGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    logError(event.error ?? event.message, { source: 'window.error' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { source: 'unhandledrejection' });
  });
}
