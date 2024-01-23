import { Inject, Injectable, Logger } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'

import { DatabaseService } from '@/database/database.service'
import { DatabaseException } from '@/database/exceptions/database.exception'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'
import { UserUniqueConstraintViolationException } from '@/users/exceptions/user.unique-constraint-violation.exception'

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger('UserRepository')

  constructor(
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Creates a new user in the database.
   *
   * This method takes a user creation object and persists it in the database.
   * Error handling is incorporated to catch and log any issues that occur during the database operation, converting them into a DatabaseException.
   *
   * @param user - Object containing data for creating a new user.
   * @returns A Promise resolving to the newly created User object.
   * @throws UserUniqueConstraintViolationException if the provided email is already in use.
   * @throws DatabaseException on any error during the database operation.
   */
  async create(user: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.databaseService.user.create({
        data: {
          ...user,
        },
      })
    } catch (error) {
      this.logger.error(error, error.stack)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new UserUniqueConstraintViolationException()
      }
      throw new DatabaseException({ error })
    }
  }

  /**
   * Retrieves all users from the database.
   *
   * This method fetches an array of all User objects stored in the database.
   * It includes error handling to catch and log issues, converting them into a DatabaseException for uniform error management.
   *
   * @returns A Promise resolving to an array of User objects.
   * @throws DatabaseException on any error during the database operation.
   */
  async find(): Promise<User[]> {
    try {
      return await this.databaseService.user.findMany()
    } catch (error) {
      this.logger.error(error, error.stack)
      throw new DatabaseException({ error })
    }
  }

  /**
   * Retrieves a single user by their ID.
   *
   * This method finds and returns a User object based on the provided userId.
   * It includes error handling for database operation failures, logging issues, and throwing either a UserNotFoundException for a missing user or a DatabaseException for other errors.
   *
   * @param userId - The ID of the user to be retrieved.
   * @returns A Promise resolving to the User object.
   * @throws UserNotFoundException if no user is found with the provided ID.
   * @throws DatabaseException on any other error during the database operation.
   */
  async findOne(userId: string): Promise<User> {
    try {
      return await this.databaseService.user.findUniqueOrThrow({
        where: { id: userId },
      })
    } catch (error) {
      this.logger.error(error, error.stack)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new UserNotFoundException({
            userId,
          })
      }
      throw new DatabaseException({ error })
    }
  }

  /**
   * Updates a user in the database.
   *
   * This method allows updating a user's information based on the provided userId.
   * It includes comprehensive error handling, catching and logging errors, and converting them into either a UserNotFoundException (if the user doesn't exist) or a DatabaseException for other errors.
   *
   * @param userId - The ID of the user to be updated.
   * @param user - Object containing update data for the user.
   * @returns A Promise resolving to the updated User object.
   * @throws UserUniqueConstraintViolationException if the provided email is already in use.
   * @throws UserNotFoundException if no user is found with the provided ID.
   * @throws DatabaseException on any other error during the database operation.
   */
  async update(userId: string, user: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.databaseService.user.update({
        where: { id: userId },
        data: {
          ...user,
        },
      })
    } catch (error) {
      this.logger.error(error, error.stack)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new UserUniqueConstraintViolationException()
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new UserNotFoundException({
            userId,
          })
      }
      throw new DatabaseException({ error })
    }
  }

  /**
   * Deletes a user from the database.
   *
   * This method removes a user from the database based on the provided userId.
   * It includes error handling for the database operation, logging issues, and throwing either a UserNotFoundException (if the user doesn't exist) or a DatabaseException for other errors.
   *
   * @param userId - The ID of the user to be deleted.
   * @returns A Promise resolving to the deleted User object.
   * @throws UserNotFoundException if no user is found with the provided ID.
   * @throws DatabaseException on any other error during the database operation.
   */
  async delete(userId: string): Promise<User> {
    try {
      return await this.databaseService.user.delete({
        where: { id: userId },
      })
    } catch (error) {
      this.logger.error(error, error.stack)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new UserNotFoundException({
            userId,
          })
      }
      throw new DatabaseException({ error })
    }
  }

  /**
   * Retrieves first-degree friends of a given user.
   *
   * - Complexity: O(n), where n is the number of direct friends.
   * - Current Limitations: This implementation fetches all direct friends in a single query, which might not be efficient for users with a very large number of friends. A better way would be to use a recursive function to find friends of friends of friends, but it would be more complex and Prisma doesn't support recursive queries yet.
   * - Best practices not included:
   *   - Pagination: To handle large data sets efficiently, implement pagination to fetch friends in chunks.
   *   - Caching: Consider caching the results, especially for users with a stable friend list.
   *
   * @param userId - The ID of the user whose first-degree friends are to be found.
   * @returns A Promise resolving to an array of User objects representing first-degree friends.
   */
  async findFirstDegreeFriends(userId: string): Promise<User[]> {
    const directFriends = await this.databaseService.$queryRaw<User[]>`
      SELECT u.*
      FROM users u
      INNER JOIN friends f ON f."friendId" = u.id
      WHERE f."friendOfId" = ${userId}
      ORDER BY u.id;
    `

    return directFriends
  }

  /**
   * Retrieves second-degree friends of a given user.
   *
   * - Complexity: Potentially O(n^2), where n is the number of first-degree friends.
   * - Current Limitations: This function can be inefficient for users with many friends, as it leads to multiple nested database queries.
   * - Best practices not included:
   *   - Pagination: Implementing pagination can significantly reduce the load on the database by fetching friends in manageable batches.
   *   - Caching: Caching results for users with a stable network can improve performance.
   *
   * @param userId - The ID of the user whose second-degree friends are to be found.
   * @returns A Promise resolving to an array of User objects representing second-degree friends.
   */

  async findSecondDegreeFriends(userId: string): Promise<User[]> {
    const secondDegreeFriends = await this.databaseService.$queryRaw<User[]>`
      WITH RECURSIVE friends_cte AS (
        SELECT f."friendId", 1 AS degree
        FROM friends f
        WHERE f."friendOfId" = ${userId}
        UNION ALL
        SELECT f."friendId", fc."degree" + 1
        FROM friends f
        INNER JOIN friends_cte fc ON f."friendOfId" = fc."friendId"
        WHERE fc."degree" = 1 AND f."friendId" != ${userId}
      )
      SELECT DISTINCT u.*
      FROM friends_cte fc
      JOIN users u ON u.id = fc."friendId"
      WHERE fc."degree" = 2
      ORDER BY u.id;
    `

    return secondDegreeFriends
  }

  /**
   * Retrieves third-degree friends of a given user.
   *
   * - Complexity: Can potentially be O(n^3), where n is the number of first-degree friends.
   * - Current Limitations: Highly inefficient for densely connected networks or users with a large number of friends due to multiple nested database queries.
   * - Best practices not included:
   *   - Pagination: Essential for managing the potentially large result set and reducing database load.
   *   - Caching: Beneficial for users with infrequently changing friend networks.
   *   - Asynchronous Processing: For very large datasets, consider processing the query asynchronously and notifying the user when the results are ready.
   *
   * Caution: This function can be very resource-intensive and should be optimized or used with caution.
   *
   * @param userId - The ID of the user whose third-degree friends are to be found.
   * @returns A Promise resolving to an array of User objects representing third-degree friends.
   */
  async findThirdDegreeFriends(userId: string): Promise<User[]> {
    const thirdDegreeFriends = await this.databaseService.$queryRaw<User[]>`
      WITH RECURSIVE friends_cte AS (
        SELECT f."friendId", 1 AS degree
        FROM friends f
        WHERE f."friendOfId" = ${userId}
        UNION ALL
        SELECT f."friendId", fc."degree" + 1
        FROM friends f
        INNER JOIN friends_cte fc ON f."friendOfId" = fc."friendId"
        WHERE fc.degree < 3 AND f."friendId" NOT IN (
          SELECT f2."friendId"
          FROM friends f2
          WHERE f2."friendOfId" = ${userId}
        )
      )
      SELECT DISTINCT u.*
      FROM friends_cte fc
      JOIN users u ON u.id = fc."friendId"
      WHERE fc."degree" = 3
      ORDER BY u.id;  -- Pagination
    `

    return thirdDegreeFriends
  }
}
