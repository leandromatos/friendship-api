import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
} from '@nestjs/swagger'

import { UnprocessableEntityException } from '@/exceptions/unprocessable-entity.exception'
import { invalidRequestBodyExample, userNotFoundExample } from '@/users/docs/examples.doc'
import { UpdateUserRequest } from '@/users/dto/update-user.request'
import { UserResponse } from '@/users/dto/user.response'

export const UpdateUserDoc: MethodDecorator[] = [
  ApiOperation({
    summary: "Endpoint to update a user's information.",
    description:
      "This PATCH endpoint allows for partial updates to a user's details. It takes the updated user data from the request body and the user's ID from the route parameters, processes the update through the UsersService, and returns the updated UserResponse object.",
  }),
  ApiBody({
    type: UpdateUserRequest,
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
  ApiNotFoundResponse({
    description: 'User not found',
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(UnprocessableEntityException),
        },
        examples: {
          'User not found': userNotFoundExample,
        },
      },
    },
  }),
]
