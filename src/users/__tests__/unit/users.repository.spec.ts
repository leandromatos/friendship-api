import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { Prisma } from '@prisma/client'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { DatabaseService } from '@/database/database.service'
import { DatabaseException } from '@/database/exceptions/database.exception'
import { UsersRepository } from '@/users/users.repository'

describe('UsersRepository', () => {
  let app: NestApplication
  let usersRepository: UsersRepository

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, DatabaseService],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        user: {
          findUserWithRoleAndPermissionsOrThrow: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $on: jest.fn(),
      })
      .setLogger(new EmptyLogger())
      .compile()
    app = moduleFixture.createNestApplication()
    usersRepository = app.get<UsersRepository>(UsersRepository)
  })

  afterEach(async () => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  describe('find', () => {
    it('should throw a generic DatabaseException when something goes wrong with the query or the database service', async () => {
      const result = usersRepository.find()

      await expect(result).rejects.toThrow(DatabaseException)
    })
  })

  describe('findOne', () => {
    it('should throw a generic DatabaseException when something goes wrong with the query or the database service', async () => {
      const userId = 'user_id'

      const result = usersRepository.findOne(userId)

      await expect(result).rejects.toThrow(DatabaseException)
    })
  })

  describe('update', () => {
    it('should throw a generic DatabaseException when something goes wrong with the query or the database service', async () => {
      const userId = 'user_id'
      const body: Prisma.UserUpdateInput = {
        name: 'John Doe',
      }

      const result = usersRepository.update(userId, body)

      await expect(result).rejects.toThrow(DatabaseException)
    })
  })

  describe('delete', () => {
    it('should throw a generic DatabaseException when something goes wrong with the query or the database service', async () => {
      const userId = 'user_id'

      const result = usersRepository.delete(userId)

      await expect(result).rejects.toThrow(DatabaseException)
    })
  })
})
