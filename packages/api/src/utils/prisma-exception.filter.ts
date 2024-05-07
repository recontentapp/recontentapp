import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library'
import { Response } from 'express'

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
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let httpStatus = 500

    if (exception instanceof PrismaClientRustPanicError) {
      httpStatus = 400
    } else if (exception instanceof PrismaClientValidationError) {
      httpStatus = 422
    } else if (exception instanceof PrismaClientKnownRequestError) {
      httpStatus = 400
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      httpStatus = 400
    } else if (exception instanceof PrismaClientInitializationError) {
      httpStatus = 400
    } else {
      try {
        const status = exception.getStatus()
        httpStatus = status
      } catch (e) {}
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
