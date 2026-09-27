/**
 * @jeanius/observability
 * Structured logging, correlation IDs, and metrics tracing.
 */

export interface LogContext {
  readonly correlationId?: string;
  readonly orderId?: string;
  readonly userId?: string;
  readonly [key: string]: unknown;
}

export class Logger {
  constructor(private readonly serviceName: string) {}

  info(message: string, context?: LogContext): void {
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        message,
        ...context,
      }),
    );
  }

  warn(message: string, context?: LogContext): void {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        message,
        ...context,
      }),
    );
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        message,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error,
        ...context,
      }),
    );
  }
}

export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName);
}
