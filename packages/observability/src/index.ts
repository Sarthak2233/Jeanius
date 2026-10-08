/**
 * @jeanius/observability
 * Structured logging, correlation IDs, and metrics tracing.
 */
import { randomUUID } from 'node:crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  readonly traceId?: string;
  readonly correlationId?: string;
  readonly orderId?: string;
  readonly userId?: string;
  readonly actorId?: string;
  readonly jobId?: string;
  readonly slug?: string;
  readonly durationMs?: number;
  readonly [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getActiveLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

export class Logger {
  constructor(private readonly serviceName: string) {}

  private shouldLog(level: LogLevel): boolean {
    const activeLevel = getActiveLogLevel();
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[activeLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown,
  ): string {
    const isProd = process.env.NODE_ENV === 'production';
    const timestamp = new Date().toISOString();

    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: isProd ? undefined : error.stack }
        : error;

    if (isProd) {
      return JSON.stringify({
        timestamp,
        level,
        service: this.serviceName,
        message,
        error: errorDetails,
        context: context ? { ...context } : undefined,
      });
    }

    const durationStr = context?.durationMs !== undefined ? ` (+${context.durationMs}ms)` : '';
    const traceStr = context?.traceId ? ` [trace:${context.traceId.slice(0, 8)}]` : '';
    const payload = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase().padEnd(5)} [${this.serviceName}]${traceStr} ${message}${durationStr}${payload}`;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context, error));
  }

  async withTiming<T>(operation: string, fn: () => Promise<T>, context?: LogContext): Promise<T> {
    const start = Date.now();
    this.debug(`Started ${operation}`, context);
    try {
      const result = await fn();
      const durationMs = Date.now() - start;
      this.info(`Completed ${operation}`, { ...context, durationMs });
      return result;
    } catch (err: unknown) {
      const durationMs = Date.now() - start;
      this.error(`Failed ${operation}`, err, { ...context, durationMs });
      throw err;
    }
  }
}

export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName);
}

export function generateTraceId(): string {
  try {
    return randomUUID();
  } catch {
    return `trc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
