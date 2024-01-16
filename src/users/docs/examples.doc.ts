import { BadRequestException, HttpStatus } from '@nestjs/common'
import { ExampleObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { UnprocessableEntityException } from '@/exceptions/unprocessable-entity.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'

export const invalidRequestBodyExample: ExampleObject = {
  description: 'When the request has invalid body, a validation exception throws with more details.',
  value: {
    statusCode: UnprocessableEntityException.statusCode,
    type: exceptionNameToType(UnprocessableEntityException.name),
    message: UnprocessableEntityException.message,
    data: {
      errors: [
        {
          field: 'name',
          rule: 'IS_NOT_EMPTY',
          message: 'name should not be empty',
        },
      ],
    },
  },
}

export const userNotFoundExample: ExampleObject = {
  description: 'When the user was not found.',
  value: {
    statusCode: HttpStatus.NOT_FOUND,
    type: exceptionNameToType(UserNotFoundException.name),
    message: UserNotFoundException.message,
    data: {
      userId: '57187a5c-bca0-4de7-8046-3a68159e9f55',
    },
  },
}

export const invalidDegreeExample: ExampleObject = {
  description: 'When the degree was not provided or is invalid.',
  value: {
    statusCode: HttpStatus.BAD_REQUEST,
    type: exceptionNameToType(BadRequestException.name),
    message: 'Invalid degree',
  },
}
