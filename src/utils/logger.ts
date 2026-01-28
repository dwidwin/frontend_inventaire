type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // En production, on log seulement les erreurs
    if (isProduction) {
      return level === 'error'
    }
    // En développement, on log tout
    return true
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (args.length > 0) {
      return `${prefix} ${message}`
    }
    return `${prefix} ${message}`
  }

  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message), ...args)
  }

  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return
    console.info(this.formatMessage('info', message), ...args)
  }

  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message), ...args)
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (!this.shouldLog('error')) return
    
    if (error instanceof Error) {
      console.error(this.formatMessage('error', message), error, ...args)
    } else if (error) {
      console.error(this.formatMessage('error', message), error, ...args)
    } else {
      console.error(this.formatMessage('error', message), ...args)
    }
  }

  // Méthodes de compatibilité pour migration progressive
  log(message: string, ...args: any[]): void {
    this.info(message, ...args)
  }
}

export const logger = new Logger()
export default logger
