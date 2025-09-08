/**
 * Production-ready logging utility
 * Replaces console.log statements with proper logging
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context, error);
    
    if (this.isProduction) {
      // In production, send to external logging service (e.g., Sentry, DataDog, etc.)
      // For now, we'll use structured logging
      const logString = JSON.stringify(logEntry);
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(logString);
          break;
        case LogLevel.WARN:
          console.warn(logString);
          break;
        case LogLevel.INFO:
          console.info(logString);
          break;
        case LogLevel.DEBUG:
          console.debug(logString);
          break;
      }
    } else {
      // In development, use colored console output
      const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
      const colors = ['\x1b[31m', '\x1b[33m', '\x1b[36m', '\x1b[37m']; // Red, Yellow, Cyan, White
      const reset = '\x1b[0m';
      
      const coloredLevel = `${colors[level]}${levelNames[level]}${reset}`;
      const timestamp = `[${logEntry.timestamp}]`;
      
      console.log(`${timestamp} ${coloredLevel}: ${message}`);
      
      if (context) {
        console.log('  Context:', context);
      }
      
      if (error) {
        console.log('  Error:', error);
      }
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for common use cases
export const logError = (message: string, error?: Error, context?: Record<string, any>) => {
  logger.error(message, context, error);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};

export default logger;
