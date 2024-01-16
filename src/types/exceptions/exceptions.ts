import { HttpExceptionOptions, HttpStatus } from '@nestjs/common'

export type Exception = {
  statusCode: HttpStatus
  message: string
  data?: object
  options?: HttpExceptionOptions
}

export type HttpExceptionFilterResponseBody = {
  statusCode: HttpStatus
  type: string
  message: string
  data?: object
}
