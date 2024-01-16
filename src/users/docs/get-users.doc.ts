import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { UserResponse } from '@/users/dto/user.response'

export const GetUsersDoc: MethodDecorator[] = [
  ApiOperation({
    summary: 'Endpoint to retrieve all users.',
    description:
      'This GET endpoint fetches a list of all users in the system. It utilizes the UsersService to retrieve the data and returns an array of UserResponse objects.',
  }),
  ApiOkResponse({
    type: UserResponse,
    description: 'User',
    isArray: true,
  }),
]
