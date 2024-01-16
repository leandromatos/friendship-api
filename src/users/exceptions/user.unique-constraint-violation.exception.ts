import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

import { BaseException } from '@/exceptions/base.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'

const MESSAGE = 'There is a unique constraint violation, a new user cannot be created with this email'

export class UserUniqueConstraintViolationException extends BaseException {
  static readonly statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  static readonly message: string = MESSAGE

  @ApiProperty({
    default: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  statusCode = UserUniqueConstraintViolationException.statusCode

  @ApiProperty({
    default: exceptionNameToType('UsersUniqueConstraintViolationException'),
  })
  type = exceptionNameToType(this.name)

  @ApiProperty({
    type: String,
    default: MESSAGE,
  })
  message = UserUniqueConstraintViolationException.message

  constructor() {
    const message = UserUniqueConstraintViolationException.message
    const statusCode = UserUniqueConstraintViolationException.statusCode

    super({ message, statusCode })
  }
}
