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

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    let errorMessage = 'Something went wrong'
    let httpStatus = 500

    if (exception instanceof PrismaClientRustPanicError) {
      httpStatus = 400
      errorMessage = exception.message
    } else if (exception instanceof PrismaClientValidationError) {
      httpStatus = 422
      errorMessage = exception.message
    } else if (exception instanceof PrismaClientKnownRequestError) {
      httpStatus = 400
      errorMessage = exception.message
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      httpStatus = 400
      errorMessage = exception.message
    } else if (exception instanceof PrismaClientInitializationError) {
      httpStatus = 400
      errorMessage = exception.message
    } else {
      httpStatus = status
    }

    response.status(httpStatus).json({
      statusCode: httpStatus,
      error: errorMessage,
    })
  }
}
