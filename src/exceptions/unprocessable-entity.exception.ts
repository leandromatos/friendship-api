import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { snakeCase } from 'case-anything'
import { ValidationError } from 'class-validator'

import { BaseException } from '@/exceptions/base.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'

const MESSAGE = 'Request validation error'

export class UnprocessableEntityException extends BaseException {
  static readonly statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY
  static readonly message: string = MESSAGE

  @ApiProperty({
    default: HttpStatus.UNPROCESSABLE_ENTITY,
  })
  statusCode: HttpStatus.UNPROCESSABLE_ENTITY

  @ApiProperty({
    default: exceptionNameToType('RequestValidationException'),
  })
  type = exceptionNameToType(this.name)

  @ApiProperty({
    type: String,
    default: MESSAGE,
  })
  message = UnprocessableEntityException.message

  constructor(validationErrors: ValidationError[]) {
    const statusCode = UnprocessableEntityException.statusCode
    const message = UnprocessableEntityException.message
    const data = UnprocessableEntityException.validationErrorsToData(validationErrors)

    super({ statusCode, message, data })
  }

  static validationErrorsToData(validationErrors: ValidationError[]) {
    const errors = validationErrors.flatMap(({ property, constraints }) => {
      return Object.entries(constraints).map(([type, message]) => {
        const field = property
        const rule = UnprocessableEntityException.constraintTypeToRule(type)

        return { field, rule, message }
      })
    })

    return { errors }
  }

  static constraintTypeToRule(type: string) {
    return snakeCase(type).toUpperCase()
  }
}
