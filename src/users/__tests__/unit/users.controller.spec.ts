import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { DatabaseModule } from '@/database/database.module'
import { UserFactory } from '@/database/factories/user.factory'
import { CreateUserRequest } from '@/users/dto/create-user.request'
import { UserController } from '@/users/users.controller'
import { UsersModule } from '@/users/users.module'
import { UsersService } from '@/users/users.service'

describe('UsersController', () => {
  let usersController: UserController
  let usersService: UsersService
  const userFactory = new UserFactory()

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue({
        createUser: jest.fn(),
        getUsers: jest.fn(),
        getUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        getFriendsByDegree: jest.fn(),
      })
      .setLogger(new EmptyLogger())
      .compile()
    usersController = moduleFixture.get<UserController>(UserController)
    usersService = moduleFixture.get<UsersService>(UsersService)
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  describe('createUser', () => {
    it('should call usersService.createUser and return created user', async () => {
      const createUserRequest: CreateUserRequest = {
        name: 'John Doe',
        email: 'john.doe@acme.com',
      }
      jest.spyOn(usersService, 'createUser').mockResolvedValueOnce(createUserRequest as User)

      const response = await usersController.createUser(createUserRequest)

      expect(usersService.createUser).toHaveBeenCalledWith(createUserRequest)
      expect(response).toEqual(createUserRequest)
    })
  })

  describe('getUsers', () => {
    it('should call usersService.getUsers and return empty array', async () => {
      const users: User[] = []
      jest.spyOn(usersService, 'getUsers').mockResolvedValueOnce(users)

      const response = await usersController.getUsers()

      expect(usersService.getUsers).toHaveBeenCalled()
      expect(response).toEqual(users)
      expect(response).toHaveLength(users.length)
    })

    it('should call usersService.getUsers and return users', async () => {
      const users = [userFactory.create().data, userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersService, 'getUsers').mockResolvedValueOnce(users)

      const response = await usersController.getUsers()

      expect(usersService.getUsers).toHaveBeenCalled()
      expect(response).toEqual(users)
      expect(response).toHaveLength(users.length)
    })
  })

  describe('getUser', () => {
    it('should call usersService.getUserFromId and return user', async () => {
      const { data: user } = userFactory.create()
      jest.spyOn(usersService, 'getUser').mockResolvedValueOnce(user as User)

      const response = await usersController.getUser('user_id')

      expect(usersService.getUser).toHaveBeenCalledWith('user_id')
      expect(response).toEqual(user)
    })
  })

  describe('updateUser', () => {
    it('should call usersService.updateUser and return updated user', async () => {
      const { data: user } = userFactory.create()
      jest.spyOn(usersService, 'updateUser').mockResolvedValueOnce(user as User)

      const response = await usersController.updateUser(user.id, user as User)

      expect(usersService.updateUser).toHaveBeenCalledWith(user.id, user)
      expect(response).toEqual(user)
    })
  })

  describe('deleteUser', () => {
    it('should call usersService.deleteUser', async () => {
      const { data: user } = userFactory.create()
      jest.spyOn(usersService, 'deleteUser').mockResolvedValueOnce(user as User)

      await expect(usersController.deleteUser(user.id)).resolves.not.toThrow()
      expect(usersService.deleteUser).toHaveBeenCalledWith(user.id)
    })
  })

  describe('getFriendsByDegree', () => {
    it('should call usersService.getFriendsByDegree and return friends by first degree', async () => {
      const { data: user } = userFactory.create()
      const friends = [userFactory.create().data, userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersService, 'getFriendsByDegree').mockResolvedValueOnce(friends)

      const response = await usersController.getFriendsByDegree(user.id, 1)

      expect(usersService.getFriendsByDegree).toHaveBeenCalledWith(user.id, 1)
      expect(response).toEqual(friends)
      expect(response).toHaveLength(friends.length)
    })

    it('should call usersService.getFriendsByDegree and return friends by second degree', async () => {
      const { data: user } = userFactory.create()
      const friends = [userFactory.create().data, userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersService, 'getFriendsByDegree').mockResolvedValueOnce(friends)

      const response = await usersController.getFriendsByDegree(user.id, 2)

      expect(usersService.getFriendsByDegree).toHaveBeenCalledWith(user.id, 2)
      expect(response).toEqual(friends)
      expect(response).toHaveLength(friends.length)
    })

    it('should call usersService.getFriendsByDegree and return friends by third degree', async () => {
      const { data: user } = userFactory.create()
      const friends = [userFactory.create().data, userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersService, 'getFriendsByDegree').mockResolvedValueOnce(friends)

      const response = await usersController.getFriendsByDegree(user.id, 3)

      expect(usersService.getFriendsByDegree).toHaveBeenCalledWith(user.id, 3)
      expect(response).toEqual(friends)
      expect(response).toHaveLength(friends.length)
    })

    it('should throw an error when the degree is invalid', async () => {
      const { data: user } = userFactory.create()
      jest.spyOn(usersService, 'getFriendsByDegree').mockRejectedValueOnce(BadRequestException)

      await expect(usersController.getFriendsByDegree(user.id, 4)).rejects.toThrow(Error)
      expect(usersService.getFriendsByDegree).toHaveBeenCalledWith(user.id, 4)
    })
  })
})
