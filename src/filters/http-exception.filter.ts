import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { Response } from 'express'

import { BaseException } from '@/exceptions/base.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'
import { Exception, HttpExceptionFilterResponseBody } from '@/types/exceptions/exceptions'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const statusCode = exception.getStatus()
    const type = exceptionNameToType(exception.name)
    const message = exception.message
    const body: HttpExceptionFilterResponseBody = {
      statusCode,
      type,
      message,
    }
    if (exception instanceof BaseException)
      exception.getResponse() && (body.data = (exception.getResponse() as Exception).data)

    response.status(statusCode).json(body)
  }
}
