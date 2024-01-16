import { ApiBody, ApiOkResponse, ApiOperation, ApiUnprocessableEntityResponse, getSchemaPath } from '@nestjs/swagger'

import { UnprocessableEntityException } from '@/exceptions/unprocessable-entity.exception'
import { invalidRequestBodyExample } from '@/users/docs/examples.doc'
import { CreateUserRequest } from '@/users/dto/create-user.request'
import { UserResponse } from '@/users/dto/user.response'

export const CreateUserDoc: MethodDecorator[] = [
  ApiOperation({
    summary: 'Endpoint to create a new user.',
    description:
      'This POST endpoint handles the creation of a new user. It takes user details from the request body, processes them through the UsersService, and returns the newly created user.',
  }),
  ApiBody({
    type: CreateUserRequest,
    description: 'User',
  }),
  ApiOkResponse({
    type: UserResponse,
    description: 'User',
  }),
  ApiUnprocessableEntityResponse({
    description: 'Request validation error',
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(UnprocessableEntityException),
        },
        examples: {
          'Invalid request body': invalidRequestBodyExample,
        },
      },
    },
  }),
]
