import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { UserFactory } from '@/database/factories/user.factory'
import { CreateUserRequest } from '@/users/dto/create-user.request'
import { UpdateUserRequest } from '@/users/dto/update-user.request'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'
import { UsersRepository } from '@/users/users.repository'
import { UsersService } from '@/users/users.service'

describe('UsersService', () => {
  let usersRepository: UsersRepository
  let usersService: UsersService
  const userFactory = new UserFactory()

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UsersRepository],
    })
      .overrideProvider(UsersRepository)
      .useValue({
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirstDegreeFriends: jest.fn(),
        findSecondDegreeFriends: jest.fn(),
        findThirdDegreeFriends: jest.fn(),
      })
      .setLogger(new EmptyLogger())
      .compile()
    usersRepository = moduleFixture.get<UsersRepository>(UsersRepository)
    usersService = moduleFixture.get<UsersService>(UsersService)
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  describe('createUser', () => {
    it('should create a new user and return an instance of User', async () => {
      const createUserRequest: CreateUserRequest = {
        name: 'John Doe',
        email: 'john.doe@acme.com',
      }
      const createdUser: Partial<User> = {
        ...createUserRequest,
      }
      jest.spyOn(usersRepository, 'create').mockResolvedValueOnce(createdUser as User)

      const result = await usersService.createUser(createUserRequest)

      expect(usersRepository.create).toHaveBeenCalledWith(createUserRequest)
      expect(result).toEqual(createdUser)
    })
  })

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const users: User[] = [userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersRepository, 'find').mockResolvedValueOnce(users)

      const result = await usersService.getUsers()

      expect(usersRepository.find).toHaveBeenCalled()
      expect(result).toEqual(users)
      expect(result).toHaveLength(users.length)
    })
  })

  describe('getUser', () => {
    it('should return a user', async () => {
      const user: User = userFactory.create().data as User
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user)

      const result = await usersService.getUser(user.id)

      expect(usersRepository.findOne).toHaveBeenCalledWith(user.id)
      expect(result).toEqual(user)
    })

    it('should throw an error when user is not found', async () => {
      const nonExistentUserId = 'non_existent_user_id'
      jest.spyOn(usersRepository, 'findOne').mockImplementation(() => Promise.reject(new UserNotFoundException()))

      await expect(usersService.getUser(nonExistentUserId)).rejects.toThrow(UserNotFoundException)
      expect(usersRepository.findOne).toHaveBeenCalledWith(nonExistentUserId)
    })
  })

  describe('updateUser', () => {
    it('should update a user and return it', async () => {
      const { data: user } = userFactory.create()
      const updateUserRequest: UpdateUserRequest = {
        name: 'John Doe',
      }
      const updatedUser: Partial<User> = {
        ...updateUserRequest,
      }
      jest.spyOn(usersRepository, 'update').mockResolvedValueOnce(updatedUser as User)

      const result = await usersService.updateUser(user.id, updateUserRequest)

      expect(usersRepository.update).toHaveBeenCalledWith(user.id, updateUserRequest)
      expect(result).toEqual(updatedUser)
    })

    it('should throw an error when user is not found', async () => {
      const nonExistentUserId = 'non_existent_user_id'
      const updateUserRequest: UpdateUserRequest = {
        name: 'John Doe',
      }
      jest.spyOn(usersRepository, 'update').mockImplementation(() => Promise.reject(new UserNotFoundException()))

      await expect(usersService.updateUser(nonExistentUserId, updateUserRequest)).rejects.toThrow(UserNotFoundException)
      expect(usersRepository.update).toHaveBeenCalledWith(nonExistentUserId, updateUserRequest)
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const { data: deletedUser } = userFactory.create()
      jest.spyOn(usersRepository, 'delete').mockResolvedValueOnce(deletedUser as User)

      await expect(usersService.deleteUser(deletedUser.id)).resolves.not.toThrow()
      expect(usersRepository.delete).toHaveBeenCalledWith(deletedUser.id)
    })

    it('should throw an error when user is not found', async () => {
      const nonExistentUserId = 'non_existent_user_id'
      jest.spyOn(usersRepository, 'delete').mockImplementation(() => Promise.reject(new UserNotFoundException()))

      await expect(usersService.deleteUser(nonExistentUserId)).rejects.toThrow(UserNotFoundException)
      expect(usersRepository.delete).toHaveBeenCalledWith(nonExistentUserId)
    })
  })

  describe('getFriends', () => {
    it('should return a list of friends in the first degree', async () => {
      const { data: user } = userFactory.create()
      const friends = [userFactory.create().data, userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersRepository, 'findFirstDegreeFriends').mockResolvedValueOnce(friends)

      const result = await usersService.getFriendsByDegree(user.id, 1)

      expect(usersRepository.findFirstDegreeFriends).toHaveBeenCalledWith(user.id)
      expect(result).toEqual(friends)
      expect(result).toHaveLength(friends.length)
    })

    it('should return a list of friends in the second degree', async () => {
      const { data: user } = userFactory.create()
      const friends = [userFactory.create().data, userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersRepository, 'findSecondDegreeFriends').mockResolvedValueOnce(friends)

      const result = await usersService.getFriendsByDegree(user.id, 2)

      expect(usersRepository.findSecondDegreeFriends).toHaveBeenCalledWith(user.id)
      expect(result).toEqual(friends)
      expect(result).toHaveLength(friends.length)
    })

    it('should return a list of friends in the third degree', async () => {
      const { data: user } = userFactory.create()
      const friends = [userFactory.create().data, userFactory.create().data, userFactory.create().data] as User[]
      jest.spyOn(usersRepository, 'findThirdDegreeFriends').mockResolvedValueOnce(friends)

      const result = await usersService.getFriendsByDegree(user.id, 3)

      expect(usersRepository.findThirdDegreeFriends).toHaveBeenCalledWith(user.id)
      expect(result).toEqual(friends)
      expect(result).toHaveLength(friends.length)
    })

    it('should throw an error when user is not found', async () => {
      const nonExistentUserId = 'non_existent_user_id'
      jest
        .spyOn(usersRepository, 'findFirstDegreeFriends')
        .mockImplementation(() => Promise.reject(new UserNotFoundException()))

      await expect(usersService.getFriendsByDegree(nonExistentUserId, 1)).rejects.toThrow(UserNotFoundException)
      expect(usersRepository.findFirstDegreeFriends).toHaveBeenCalledWith(nonExistentUserId)
    })

    it('should throw an error when degree is invalid', async () => {
      const { data: user } = userFactory.create()
      const invalidDegree = 4

      await expect(usersService.getFriendsByDegree(user.id, invalidDegree)).rejects.toThrow('Invalid degree')
    })
  })
})
