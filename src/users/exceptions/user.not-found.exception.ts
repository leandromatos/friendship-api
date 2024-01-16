import { HttpStatus } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { BaseException } from '@/exceptions/base.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'

const MESSAGE = 'User not found'

export class UserNotFoundException extends BaseException {
  static readonly statusCode: HttpStatus = HttpStatus.NOT_FOUND
  static readonly message: string = MESSAGE

  @ApiProperty({
    default: HttpStatus.NOT_FOUND,
  })
  statusCode = UserNotFoundException.statusCode

  @ApiProperty({
    default: exceptionNameToType('UsersNotFoundException'),
  })
  type = exceptionNameToType(this.name)

  @ApiProperty({
    type: String,
    default: MESSAGE,
  })
  message = UserNotFoundException.message

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
  })
  data: object

  constructor(data?: object) {
    const message = UserNotFoundException.message
    const statusCode = UserNotFoundException.statusCode

    super({ message, statusCode, data })
  }
}
