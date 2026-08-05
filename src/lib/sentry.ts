import * as Sentry from "@sentry/react";

/**
 * Initializes Sentry error tracking in production when VITE_SENTRY_DSN is set.
 * Without a DSN this is a no-op, so local/dev runs stay quiet.
 */
let started = false;

export function initSentry() {
  if (started) return;
  const dsn = import.meta.env['VITE_SENTRY_DSN'] as string | undefined;
  if (!dsn) return;
  started = true;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 0,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!started) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
