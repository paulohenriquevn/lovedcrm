/**
 * Secure logging utility for frontend applications.
 * Prevents sensitive data leakage in logs.
 */

export interface LogContext {
  readonly timestamp: string
  readonly path?: string
  readonly userId?: string
  readonly requestId?: string
  readonly userAgent?: string
  readonly ip?: string
  readonly [key: string]: unknown
}

export interface LogLevel {
  readonly DEBUG: 'debug'
  readonly INFO: 'info'
  readonly WARN: 'warn'
  readonly ERROR: 'error'
}

export const LogLevels: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const

class Logger {
  private readonly isProduction = process.env.NODE_ENV === 'production'
  private readonly sensitiveFields = new Set([
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'credentials',
    'email', // In some contexts
    'ssn',
    'creditcard',
    'cvv',
  ])

  private sanitizeData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item))
    }

    return this.sanitizeObject(data as Record<string, unknown>)
  }

  private sanitizeObject(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = this.sanitizeField(key, value)
    }

    return sanitized
  }

  private sanitizeField(key: string, value: unknown): unknown {
    const lowerKey = key.toLowerCase()

    if (this.isSensitiveField(lowerKey)) {
      return '[REDACTED]'
    }

    if (typeof value === 'object') {
      return this.sanitizeData(value)
    }

    return value
  }

  private isSensitiveField(lowerKey: string): boolean {
    return this.sensitiveFields.has(lowerKey) || lowerKey.includes('password')
  }

  private formatLog(level: string, message: string, context: Partial<LogContext> = {}): void {
    const sanitizedContext = this.sanitizeData(context) as Record<string, unknown>
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(typeof sanitizedContext === 'object' && sanitizedContext !== null
        ? sanitizedContext
        : {}),
    }

    // In production, send to external logging service
    if (this.isProduction) {
      // TODO: Integrate with external logging service (e.g., Sentry, LogRocket)
      // For now, just log to console with minimal info
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          level,
          message,
          timestamp: logEntry.timestamp,
          path: context.path,
        })
      )
    } else {
      // Development logging with more details
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(logEntry, null, 2))
    }
  }

  debug(message: string, context?: Partial<LogContext>): void {
    if (!this.isProduction) {
      this.formatLog(LogLevels.DEBUG, message, context)
    }
  }

  info(message: string, context?: Partial<LogContext>): void {
    this.formatLog(LogLevels.INFO, message, context)
  }

  warn(message: string, context?: Partial<LogContext>): void {
    this.formatLog(LogLevels.WARN, message, context)
  }

  error(message: string, context?: Partial<LogContext>): void {
    this.formatLog(LogLevels.ERROR, message, context)
  }

  // Specific method for API errors
  apiError(message: string, error: unknown, context?: Partial<LogContext>): void {
    const errorContext: Partial<LogContext> = {
      ...context,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      // Only log error message in development
      errorMessage: !this.isProduction && error instanceof Error ? error.message : undefined,
    }

    this.error(message, errorContext)
  }

  // Method for tracking user actions (without sensitive data)
  userAction(action: string, userId?: string, context?: Partial<LogContext>): void {
    this.info(`User action: ${action}`, {
      ...context,
      ...(userId !== null && userId !== undefined && userId !== '' ? { userId } : {}),
      action,
    })
  }

  // Method for performance tracking
  performance(operation: string, duration: number, context?: Partial<LogContext>): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      operation,
      duration,
      unit: 'ms',
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export utility functions
export const logError = (message: string, error: unknown, context?: Partial<LogContext>): void => {
  logger.apiError(message, error, context)
}

export const logUserAction = (
  action: string,
  userId?: string,
  context?: Partial<LogContext>
): void => {
  logger.userAction(action, userId, context)
}

export const logPerformance = (
  operation: string,
  duration: number,
  context?: Partial<LogContext>
): void => {
  logger.performance(operation, duration, context)
}

// HOC for timing operations
export const withTiming = <TFunc extends (...args: unknown[]) => unknown>(
  fn: TFunc,
  operationName: string
): TFunc => {
  return ((...args: Parameters<TFunc>) => {
    const start = performance.now()
    const result = fn(...args)

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start
        logPerformance(operationName, duration)
      })
    } else {
      const duration = performance.now() - start
      logPerformance(operationName, duration)
      return result
    }
  }) as TFunc
}
