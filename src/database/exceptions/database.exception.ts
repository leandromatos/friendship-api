import { HttpStatus } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { BaseException } from '@/exceptions/base.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'

const MESSAGE = 'There is an error with the database operation'

export class DatabaseException extends BaseException {
  static readonly statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR

  static readonly message: string = MESSAGE

  @ApiProperty({
    default: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  statusCode = DatabaseException.statusCode

  @ApiProperty({
    default: exceptionNameToType('DatabaseException'),
  })
  type = exceptionNameToType(this.name)

  @ApiProperty({
    type: String,
    default: MESSAGE,
  })
  message = DatabaseException.message

  @ApiPropertyOptional({
    type: Object,
  })
  data: object

  constructor(data?: object) {
    const message = DatabaseException.message
    const statusCode = DatabaseException.statusCode

    super({ statusCode, message, data })
  }
}
