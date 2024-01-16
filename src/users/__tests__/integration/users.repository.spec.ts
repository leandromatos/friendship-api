import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { Prisma, User } from '@prisma/client'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { DatabaseService } from '@/database/database.service'
import { DatabaseException } from '@/database/exceptions/database.exception'
import { UserFactory } from '@/database/factories/user.factory'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'
import { UserUniqueConstraintViolationException } from '@/users/exceptions/user.unique-constraint-violation.exception'
import { UsersRepository } from '@/users/users.repository'

describe('UsersRepository', () => {
  let app: NestApplication
  let usersRepository: UsersRepository
  let databaseService: DatabaseService
  const userFactory = new UserFactory()

  const createUser = async (
    databaseService: DatabaseService,
    userCreateInput?: Partial<Prisma.UserCreateInput>,
  ): Promise<User> => {
    const user = userFactory.create({
      ...userCreateInput,
    })

    return await databaseService.user.create(user)
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, DatabaseService],
    })
      .setLogger(new EmptyLogger())
      .compile()
    app = moduleFixture.createNestApplication()
    usersRepository = app.get<UsersRepository>(UsersRepository)
    databaseService = app.get<DatabaseService>(DatabaseService)
  })

  afterEach(async () => {
    await databaseService.friends.deleteMany({})
    await databaseService.user.deleteMany({})
  })

  afterAll(async () => {
    await databaseService.friends.deleteMany({})
    databaseService.user.deleteMany({})
    await app.close()
  })

  describe('create', () => {
    it('should create user', async () => {
      const user = userFactory.build()
      const response = await usersRepository.create(user)

      expect(response).toHaveProperty('name', user.name)
      expect(response).toHaveProperty('email', user.email)
    })

    it('should throw an error when email is duplicated', async () => {
      const email = 'john.doe@acme.com'
      const users = [userFactory.build({ email }), userFactory.build({ email })]

      await usersRepository.create(users.at(0))
      await expect(usersRepository.create(users.at(1))).rejects.toThrow(UserUniqueConstraintViolationException)
    })

    it('should throw an error when the required fields are not provided', async () => {
      const user: Prisma.UserCreateInput = {} as Prisma.UserCreateInput

      await expect(usersRepository.create(user)).rejects.toThrow(DatabaseException)
    })
  })

  describe('find', () => {
    it('should return a list of users', async () => {
      const users = [await createUser(databaseService), await createUser(databaseService)]

      const result = await usersRepository.find()

      expect(result).toHaveLength(users.length)
    })

    it('should return null when a user is not found', async () => {
      const response = await usersRepository.find()

      expect(response).toHaveLength(0)
    })
  })

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = await createUser(databaseService)

      const response = await usersRepository.findOne(user.id)

      expect(response).toHaveProperty('id', user.id)
    })

    it('should throw a UsersNotFoundException when a user does not exist', async () => {
      const nonExistentUserId = 'non_existent_user_id'

      await expect(usersRepository.findOne(nonExistentUserId)).rejects.toThrow(UserNotFoundException)
    })
  })

  describe('update', () => {
    it('should update user', async () => {
      const user = await createUser(databaseService)
      const request = {
        name: 'John Doe',
      }

      const response = await usersRepository.update(user.id, request)

      expect(response).toHaveProperty('name', request.name)
    })

    it('should throw a UsersUniqueConstraintViolationException when the e-mail is already used', async () => {
      const users = [
        await createUser(databaseService, { email: 'john.doe@acme.com' }),
        await createUser(databaseService, { email: 'jane.doe@acme.com' }),
      ]

      await expect(
        usersRepository.update(users.at(1).id, {
          email: 'john.doe@acme.com',
        }),
      ).rejects.toThrow(UserUniqueConstraintViolationException)
    })

    it('should throw a UsersNotFoundException when a user does not exist', async () => {
      const nonExistentUserId = 'non_existent_user_id'
      const request = {
        name: 'John Doe',
      }

      await expect(usersRepository.update(nonExistentUserId, request)).rejects.toThrow(UserNotFoundException)
    })
  })

  describe('delete', () => {
    it('should delete user', async () => {
      const user = await createUser(databaseService)

      await expect(usersRepository.delete(user.id)).resolves.not.toThrow()
    })

    it('should throw a UsersNotFoundException when a user does not exist', async () => {
      const nonExistentUserId = 'non_existent_user_id'

      await expect(usersRepository.delete(nonExistentUserId)).rejects.toThrow(UserNotFoundException)
    })
  })

  describe('findFirstDegreeFriends', () => {
    it('should return a list of first degree friends', async () => {
      const user = await createUser(databaseService)
      const friends = [
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
      ]
      await databaseService.friends.createMany({
        data: [
          {
            friendOfId: user.id,
            friendId: friends.at(0).id,
          },
          {
            friendOfId: user.id,
            friendId: friends.at(1).id,
          },
          {
            friendOfId: user.id,
            friendId: friends.at(2).id,
          },
        ],
      })
      const response = await usersRepository.findFirstDegreeFriends(user.id)

      expect(response).toHaveLength(friends.length)
      const responseIds = response.map(user => user.id)
      const friendsIds = friends.map(friend => friend.id)
      expect(responseIds).toEqual(expect.arrayContaining(friendsIds))
    })
  })

  describe('findSecondDegreeFriends', () => {
    it('should return a list of second degree friends', async () => {
      const user = await createUser(databaseService)
      const friends = [
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
      ]
      await databaseService.friends.createMany({
        data: [
          {
            friendOfId: user.id,
            friendId: friends.at(0).id,
          },
          {
            friendOfId: user.id,
            friendId: friends.at(1).id,
          },
          {
            friendOfId: user.id,
            friendId: friends.at(2).id,
          },
          {
            friendOfId: friends.at(0).id,
            friendId: friends.at(3).id,
          },
          {
            friendOfId: friends.at(0).id,
            friendId: friends.at(4).id,
          },
          {
            friendOfId: friends.at(0).id,
            friendId: friends.at(5).id,
          },
        ],
      })

      const response = await usersRepository.findSecondDegreeFriends(user.id)

      expect(response).toHaveLength(3)
      const responseIds = response.map(user => user.id)
      const friendsIds = [friends.at(3).id, friends.at(4).id, friends.at(5).id]
      expect(responseIds).toEqual(expect.arrayContaining(friendsIds))
    })
  })

  describe('findThirdDegreeFriends', () => {
    it('should return a list of third degree friends', async () => {
      const user = await createUser(databaseService)
      const friends = [
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
        await createUser(databaseService),
      ]
      await databaseService.friends.createMany({
        data: [
          {
            friendOfId: user.id,
            friendId: friends.at(0).id,
          },
          {
            friendOfId: user.id,
            friendId: friends.at(1).id,
          },
          {
            friendOfId: user.id,
            friendId: friends.at(2).id,
          },
          {
            friendOfId: friends.at(0).id,
            friendId: friends.at(3).id,
          },
          {
            friendOfId: friends.at(0).id,
            friendId: friends.at(4).id,
          },
          {
            friendOfId: friends.at(0).id,
            friendId: friends.at(5).id,
          },
          {
            friendOfId: friends.at(3).id,
            friendId: friends.at(6).id,
          },
          {
            friendOfId: friends.at(3).id,
            friendId: friends.at(7).id,
          },
          {
            friendOfId: friends.at(3).id,
            friendId: friends.at(8).id,
          },
        ],
      })

      const response = await usersRepository.findThirdDegreeFriends(user.id)

      expect(response).toHaveLength(3)
      const responseIds = response.map(user => user.id)
      const friendsIds = [friends.at(6).id, friends.at(7).id, friends.at(8).id]
      expect(responseIds).toEqual(expect.arrayContaining(friendsIds))
    })
  })
})
