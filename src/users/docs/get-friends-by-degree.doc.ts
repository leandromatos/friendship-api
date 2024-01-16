import { BadRequestException } from '@nestjs/common'
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger'

import { invalidDegreeExample } from '@/users/docs/examples.doc'
import { UserResponse } from '@/users/dto/user.response'

export const GetFriendsByDegreeDoc: MethodDecorator[] = [
  ApiOperation({
    summary: 'Endpoint to retrieve friends of a user by a specified degree.',
    description:
      "This GET endpoint fetches friends of a user based on the degree of separation (1st, 2nd, 3rd, etc.). It takes the user's ID and the degree of friendship from the request parameters, utilizes the UsersService to find the friends, and returns them in an array of UserResponse objects.",
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
  ApiQuery({
    name: 'degree',
    description: 'Degree of friends. Must be a number between 1 and 3.',
    required: true,
    schema: {
      type: 'number',
      minimum: 1,
      maximum: 3,
    },
  }),
  ApiOkResponse({
    type: UserResponse,
    isArray: true,
    description: 'Friends',
  }),
  ApiBadRequestResponse({
    description: "The request's `degree` query parameter is invalid",
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(BadRequestException),
        },
        examples: {
          'Invalid degree': invalidDegreeExample,
        },
      },
    },
  }),
]
