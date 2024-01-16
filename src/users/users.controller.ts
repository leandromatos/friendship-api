import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiDocs } from '@/decorators/swagger.decorator'
import { CreateUserDoc } from '@/users/docs/create-user.doc'
import { DeleteUserDoc } from '@/users/docs/delete-user.doc'
import { GetFriendsByDegreeDoc } from '@/users/docs/get-friends-by-degree.doc'
import { GetUserDoc } from '@/users/docs/get-user.doc'
import { GetUsersDoc } from '@/users/docs/get-users.doc'
import { UpdateUserDoc } from '@/users/docs/update-user.doc'
import { CreateUserRequest } from '@/users/dto/create-user.request'
import { UpdateUserRequest } from '@/users/dto/update-user.request'
import { UserResponse } from '@/users/dto/user.response'
import { UsersService } from '@/users/users.service'

@Controller({
  path: 'users',
  version: '1',
})
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Endpoint to create a new user.
   *
   * This POST endpoint handles the creation of a new user.
   * It takes user details from the request body, processes them through the UsersService, and returns the newly created user.
   *
   * @param createUserRequest - The user data required to create a new user.
   * @returns A Promise resolving to the UserResponse object for the created user.
   */
  @Post()
  @ApiDocs(CreateUserDoc)
  async createUser(@Body() createUserRequest: CreateUserRequest): Promise<UserResponse> {
    return await this.userService.createUser(createUserRequest)
  }

  /**
   * Endpoint to retrieve all users.
   *
   * This GET endpoint fetches a list of all users in the system.
   * It utilizes the UsersService to retrieve the data and returns an array of UserResponse objects.
   *
   * @returns A Promise resolving to an array of UserResponse objects.
   */
  @Get()
  @ApiDocs(GetUsersDoc)
  async getUsers(): Promise<UserResponse[]> {
    return await this.userService.getUsers()
  }

  /**
   * Endpoint to retrieve a specific user by their ID.
   *
   * This GET endpoint handles fetching a single user based on their unique identifier.
   * It delegates the task of finding the user to the UsersService and returns the corresponding UserResponse object.
   *
   * @param userId - The unique identifier of the user to be retrieved.
   * @returns A Promise resolving to the UserResponse object for the requested user.
   */
  @Get(':userId')
  @ApiDocs(GetUserDoc)
  async getUser(@Param('userId') userId: string): Promise<UserResponse> {
    return await this.userService.getUser(userId)
  }

  /**
   * Endpoint to update a user's information.
   *
   * This PATCH endpoint allows for partial updates to a user's details.
   * It takes the updated user data from the request body and the user's ID from the route parameters, processes the update through the UsersService, and returns the updated UserResponse object.
   *
   * @param userId - The unique identifier of the user to be updated.
   * @param updateUserRequest - The updated user data.
   * @returns A Promise resolving to the UserResponse object for the updated user.
   */
  @Patch(':userId')
  @ApiDocs(UpdateUserDoc)
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<UserResponse> {
    return await this.userService.updateUser(userId, updateUserRequest)
  }

  /**
   * Endpoint to delete a user.
   *
   * This DELETE endpoint handles the removal of a user from the system based on their ID.
   * The operation is performed by the UsersService, and the endpoint returns the details of the deleted user in a UserResponse object.
   *
   * @param userId - The unique identifier of the user to be deleted.
   * @returns A Promise resolving to the UserResponse object for the deleted user.
   */
  @Delete(':userId')
  @ApiDocs(DeleteUserDoc)
  async deleteUser(@Param('userId') userId: string): Promise<UserResponse> {
    return await this.userService.deleteUser(userId)
  }

  /**
   * Endpoint to retrieve friends of a user by a specified degree.
   *
   * This GET endpoint fetches friends of a user based on the degree of separation (1st, 2nd, 3rd, etc.).
   * It takes the user's ID and the degree of friendship from the request parameters, utilizes the UsersService to find the friends, and returns them in an array of UserResponse objects.
   *
   * @param userId - The unique identifier of the user whose friends are to be found.
   * @param degree - The degree of friendship to be considered.
   * @returns A Promise resolving to an array of UserResponse objects representing the friends.
   * @throws BadRequestException if the degree is invalid.
   */
  @Get(':userId/friends')
  @ApiDocs(GetFriendsByDegreeDoc)
  async getFriendsByDegree(@Param('userId') userId: string, @Query('degree') degree: number): Promise<UserResponse[]> {
    return await this.userService.getFriendsByDegree(userId, degree)
  }
}
