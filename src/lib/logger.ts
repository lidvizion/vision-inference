import * as Sentry from '@sentry/nextjs';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Log context interface
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  operation?: string;
  duration?: number;
  backend?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  originalName?: string;
  sanitizedName?: string;
  detections?: number;
  instances?: number;
  labels?: number;
  inferenceTime?: number;
  hasImage?: boolean;
  maxSize?: number;
  allowedTypes?: readonly string[];
  delay?: number;
  responseFile?: string;
  responseSize?: number;
  type?: string;
  success?: boolean;
  action?: string;
  uiComponent?: string;
  metadata?: Record<string, unknown>;
}

// Simple browser-compatible logger
class SimpleLogger {
  private level: string;

  constructor() {
    this.level = process.env.LOG_LEVEL || 'info';
  }

  private shouldLog(level: string): boolean {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level as keyof typeof levels] <= levels[this.level as keyof typeof levels];
  }

  private formatLog(level: string, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'edge-vision-sdk',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      ...meta,
    };
    return JSON.stringify(logEntry);
  }

  log(level: string, message: string, meta?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const formattedLog = this.formatLog(level, message, meta);
    
    // Console output
    if (level === 'error') {
      console.error(formattedLog);
    } else if (level === 'warn') {
      console.warn(formattedLog);
    } else if (level === 'info') {
      console.info(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }
}

// Create simple logger instance
const simpleLogger = new SimpleLogger();

// Enhanced logger with Sentry integration
export class Logger {
  private static instance: Logger;
  private logger: SimpleLogger;

  private constructor() {
    this.logger = simpleLogger;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger;
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const logData = {
      level,
      message,
      ...context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // Log to Winston
    this.logger.log(level, message, logData);

    // Send to Sentry for errors and warnings
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      Sentry.withScope((scope) => {
        // Add context to Sentry scope
        if (context?.userId) scope.setUser({ id: context.userId });
        if (context?.sessionId) scope.setTag('sessionId', context.sessionId);
        if (context?.requestId) scope.setTag('requestId', context.requestId);
        if (context?.component) scope.setTag('component', context.component);
        if (context?.operation) scope.setTag('operation', context.operation);
        if (context?.metadata) scope.setContext('metadata', context.metadata);

        if (error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(message, level === LogLevel.ERROR ? 'error' : 'warning');
        }
      });
    }
  }

  public error(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Performance logging
  public performance(operation: string, duration: number, context?: LogContext) {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      ...context,
      operation,
      duration,
      type: 'performance',
    });

    // Send performance data to Sentry
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${operation} completed in ${duration}ms`,
      level: 'info',
      data: { duration, operation },
    });
  }

  // Business logic logging
  public business(event: string, context?: LogContext) {
    this.info(`Business Event: ${event}`, {
      ...context,
      type: 'business',
    });
  }

  // Security logging
  public security(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, {
      ...context,
      type: 'security',
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logError = (message: string, context?: LogContext, error?: Error) => {
  logger.error(message, context, error);
};

export const logWarn = (message: string, context?: LogContext) => {
  logger.warn(message, context);
};

export const logInfo = (message: string, context?: LogContext) => {
  logger.info(message, context);
};

export const logDebug = (message: string, context?: LogContext) => {
  logger.debug(message, context);
};

export const logPerformance = (operation: string, duration: number, context?: LogContext) => {
  logger.performance(operation, duration, context);
};

export const logBusiness = (event: string, context?: LogContext) => {
  logger.business(event, context);
};

export const logSecurity = (event: string, context?: LogContext) => {
  logger.security(event, context);
};
