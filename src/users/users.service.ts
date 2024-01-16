import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'

import { UsersRepository } from '@/users/users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Creates a new user.
   *
   * This method handles the creation of a new user. It delegates the task of persisting the user data to the UsersRepository.
   *
   * @param name - A partial User object containing the name of the user to be created.
   * @param email - A partial User object containing the email of the user to be created.
   * @returns A Promise resolving to the newly created User object.
   */
  async createUser({ name, email }: Partial<User>) {
    return await this.usersRepository.create({
      name,
      email,
    })
  }

  /**
   * Retrieves all users.
   *
   * This method fetches a list of all users. It delegates the database querying to the UsersRepository, ensuring separation of concerns.
   *
   * @returns A Promise resolving to an array of User objects.
   */
  async getUsers(): Promise<User[]> {
    return await this.usersRepository.find()
  }

  /**
   * Retrieves a single user by their ID.
   *
   * This method finds and returns a user based on their unique identifier. It uses the UsersRepository to perform the actual database query.
   *
   * @param userId - The unique identifier of the user to be retrieved.
   * @returns A Promise resolving to the User object.
   */
  async getUser(userId: string): Promise<User> {
    return await this.usersRepository.findOne(userId)
  }

  /**
   * Updates a user's information.
   *
   * This method updates the information of a user identified by their ID. It relies on the UsersRepository to handle the database operation.
   *
   * @param userId - The unique identifier of the user to be updated.
   * @param name - A partial User object containing the new name for the user.
   * @returns A Promise resolving to the updated User object.
   */
  async updateUser(userId: string, { name }: Partial<User>): Promise<User> {
    return await this.usersRepository.update(userId, {
      name,
    })
  }

  /**
   * Deletes a user.
   *
   * This method removes a user from the system based on their ID. The operation of deleting the user is performed by the UsersRepository.
   *
   * @param userId - The unique identifier of the user to be deleted.
   * @returns A Promise resolving to the deleted User object.
   */
  async deleteUser(userId: string): Promise<User> {
    return await this.usersRepository.delete(userId)
  }

  /**
   * Retrieves friends of a user by a specified degree (1st, 2nd, 3rd, etc.).
   *
   * This method determines the friends of a user at different levels of separation, depending on the degree specified. It delegates the retrieval process to the UsersRepository, which handles the logic for each degree of friendship.
   *
   * @param userId - The unique identifier of the user whose friends are to be found.
   * @param degree - The degree of friendship (1, 2, 3, etc.).
   * @returns A Promise resolving to an array of User objects representing the friends.
   * @throws BadRequestException if the provided degree is invalid.
   */
  async getFriendsByDegree(userId: string, degree: number): Promise<User[]> {
    switch (Number(degree)) {
      case 1:
        return await this.usersRepository.findFirstDegreeFriends(userId)
      case 2:
        return await this.usersRepository.findSecondDegreeFriends(userId)
      case 3:
        return await this.usersRepository.findThirdDegreeFriends(userId)
      default:
        throw new BadRequestException('Invalid degree')
    }
  }
}
