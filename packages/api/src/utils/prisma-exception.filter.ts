import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { Request, Response } from 'express'
import { MyLogger } from './logger'
import { getRequestIdFromRequest } from './request-id.middleware'

const statusCodes: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  306: 'Unused',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Required',
  413: 'Request Entry Too Large',
  414: 'Request-URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
}

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private logger: MyLogger

  constructor() {
    this.logger = new MyLogger()
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    let httpStatus = 500

    // Prisma errors
    // https://www.prisma.io/docs/orm/reference/error-reference
    if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2015':
        case 'P2025': {
          httpStatus = 404
          break
        }
        default: {
          httpStatus = 400
        }
      }
    } else {
      try {
        const status = exception.getStatus()
        httpStatus = status
      } catch (e) {}
    }

    if (httpStatus >= 500) {
      this.logger.error('Exception thrown', {
        errorMessage: exception.message,
        errorStack: exception.stack,
        requestId: getRequestIdFromRequest(request),
      })
    }

    const errorMessage =
      process.env.NODE_ENV === 'production'
        ? statusCodes[httpStatus]
        : exception.message

    response.status(httpStatus).json({
      statusCode: httpStatus,
      error: errorMessage,
    })
  }
}
