import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Exception } from '@/types/exceptions/exceptions'

export abstract class BaseException extends HttpException {
  static readonly message: string

  @ApiProperty({
    description: 'A `HttpStatus` code',
  })
  statusCode: HttpStatus

  @ApiProperty({
    description: 'The exception type',
  })
  type: string

  @ApiProperty({
    description: 'The exception message',
  })
  message: string

  @ApiPropertyOptional({
    description: 'The exception data with additional information',
  })
  data: object

  constructor({ statusCode, message, data, options }: Exception) {
    const response = {
      statusCode,
      message,
      data,
    }

    super(response, statusCode, options)
  }
}
