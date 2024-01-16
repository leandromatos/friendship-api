import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, getSchemaPath } from '@nestjs/swagger'

import { userNotFoundExample } from '@/users/docs/examples.doc'
import { UserResponse } from '@/users/dto/user.response'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'

export const GetUserDoc: MethodDecorator[] = [
  ApiOperation({
    summary: 'Endpoint to retrieve a specific user by their ID.',
    description:
      'This GET endpoint handles fetching a single user based on their unique identifier. It delegates the task of finding the user to the UsersService and returns the corresponding UserResponse object.',
  }),
  ApiParam({
    name: 'userId',
    description: 'User ID',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
    },
  }),
  ApiOkResponse({
    type: UserResponse,
    description: 'User',
  }),
  ApiNotFoundResponse({
    description: 'User not found',
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(UserNotFoundException),
        },
        examples: {
          'User not found': userNotFoundExample,
        },
      },
    },
  }),
]
