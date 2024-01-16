import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiParam, getSchemaPath } from '@nestjs/swagger'

import { userNotFoundExample } from '@/users/docs/examples.doc'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'

export const DeleteUserDoc: MethodDecorator[] = [
  ApiOperation({
    summary: 'Endpoint to delete a user.',
    description:
      'This DELETE endpoint handles the removal of a user from the system based on their ID. The operation is performed by the UsersService, and the endpoint returns the details of the deleted user in a UserResponse object.',
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
  ApiNoContentResponse(),
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
