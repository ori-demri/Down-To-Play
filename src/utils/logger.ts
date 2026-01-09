/**
 * Production-ready logging utility for React Native
 * 
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Contextual logging with tags
 * - Automatic production mode detection (disables verbose logs)
 * - Structured log output for easier debugging
 * - Performance tracking utilities
 */

// Log levels ordered by severity
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Environment detection
const isDevelopment = __DEV__;

// Default log level based on environment
const DEFAULT_LOG_LEVEL = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

// Current log level (can be changed at runtime)
let currentLogLevel: LogLevel = DEFAULT_LOG_LEVEL;

// Log colors for console output (development only)
const LOG_COLORS: Record<number, string> = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

// Log level labels
const LOG_LABELS: Record<number, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

/**
 * Format timestamp for log output
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format a log message with context
 */
function formatMessage(level: LogLevel, tag: string, message: string, data?: unknown): string {
  const timestamp = getTimestamp();
  const levelLabel = LOG_LABELS[level];
  const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${levelLabel}] [${tag}] ${message}${dataStr}`;
}

/**
 * Core logging function
 */
function log(level: LogLevel, tag: string, message: string, data?: unknown): void {
  if (level < currentLogLevel) {
    return;
  }

  const formattedMessage = formatMessage(level, tag, message, data);

  // In development, use colored console output
  if (isDevelopment) {
    const color = LOG_COLORS[level];
    const logFn = level === LogLevel.ERROR 
      ? console.error 
      : level === LogLevel.WARN 
        ? console.warn 
        : console.log;
    
    logFn(`${color}${formattedMessage}${RESET_COLOR}`);
  } else {
    // In production, only log warnings and errors
    if (level >= LogLevel.WARN) {
      const logFn = level === LogLevel.ERROR ? console.error : console.warn;
      logFn(formattedMessage);
    }
  }

  // Here you could add integration with crash reporting services like:
  // - Sentry
  // - Bugsnag
  // - Firebase Crashlytics
  // Example:
  // if (level === LogLevel.ERROR) {
  //   Sentry.captureMessage(formattedMessage, 'error');
  // }
}

/**
 * Create a logger instance with a specific tag
 * This is the recommended way to use the logger in your code
 * 
 * @example
 * ```typescript
 * const logger = createLogger('AuthService');
 * logger.info('User signed in', { userId: '123' });
 * logger.error('Sign in failed', error);
 * ```
 */
function createLogger(tag: string) {
  return {
    debug: (message: string, data?: unknown) => log(LogLevel.DEBUG, tag, message, data),
    info: (message: string, data?: unknown) => log(LogLevel.INFO, tag, message, data),
    warn: (message: string, data?: unknown) => log(LogLevel.WARN, tag, message, data),
    error: (message: string, data?: unknown) => log(LogLevel.ERROR, tag, message, data),
  };
}

// Pre-configured loggers for common modules
export const appLogger = createLogger('App');
export const fieldLogger = createLogger('Field');
export const mapLogger = createLogger('Map');
export const storageLogger = createLogger('Storage');
