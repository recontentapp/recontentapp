import { LoggerService } from '@nestjs/common'
import { Logger as WinstonLogger, format, transports } from 'winston'

export class MyLogger implements LoggerService {
  private winston: WinstonLogger

  constructor() {
    const devFormat = format.combine(
      format.colorize({ all: true }),
      format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss',
      }),
      format.align(),
      format.printf(log => {
        const { timestamp, level, message, ...rest } = log
        return `[${timestamp}] ${level}: ${message} ${JSON.stringify(rest)}`
      }),
    )
    const prodFormat = format.json()
    const usedFormat =
      process.env.NODE_ENV === 'production' ? prodFormat : devFormat

    this.winston = new WinstonLogger({
      transports: new transports.Console(),
      format: usedFormat,
    })
  }

  private formatParams(params: any[]) {
    if (params.length === 0) {
      return {}
    }

    if (params.length > 1) {
      return {
        params,
      }
    }

    const finalParams =
      typeof params[0] !== 'object' ? { context: params[0] } : params[0]

    if (!('timestamp' in finalParams)) {
      finalParams.timestamp = new Date().toISOString()
    }

    return finalParams
  }

  log(message: any, ...optionalParams: any[]) {
    this.winston.log('info', message, this.formatParams(optionalParams))
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.winston.log('crit', message, this.formatParams(optionalParams))
  }

  error(message: any, ...optionalParams: any[]) {
    this.winston.log('error', message, this.formatParams(optionalParams))
  }

  warn(message: any, ...optionalParams: any[]) {
    this.winston.log('warn', message, this.formatParams(optionalParams))
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.winston.log('debug', message, this.formatParams(optionalParams))
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.winston.log('debug', message, this.formatParams(optionalParams))
  }
}
