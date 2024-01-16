import { Test, TestingModule } from '@nestjs/testing'
import { Prisma } from '@prisma/client'

import { UserFactory } from '@/database/factories/user.factory'

describe('UserFactory', () => {
  let userFactory: UserFactory

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [UserFactory],
    }).compile()

    userFactory = moduleFixture.get<UserFactory>(UserFactory)
  })

  describe('defaultAttributes', () => {
    it('should return default attributes', () => {
      const now = new Date(Date.now())
      const expected: Partial<Prisma.UserCreateInput> = {
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        createdAt: now,
        updatedAt: now,
      }

      expect(userFactory.defaultAttributes).toEqual(expected)
    })
  })

  describe('build', () => {
    it('should build a user with default attributes', () => {
      const expected: Partial<Prisma.UserCreateInput> = {
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }

      expect(userFactory.build()).toEqual(expected)
    })

    it('should override default attributes with provided attributes', () => {
      const attributes: Partial<Prisma.UserCreateInput> = {
        name: 'John Doe',
      }
      const expected: Partial<Prisma.UserCreateInput> = {
        id: expect.any(String),
        name: 'John Doe',
        email: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }

      expect(userFactory.build(attributes)).toEqual(expected)
    })
  })

  describe('buildPrismaIncludeFromAttrs', () => {
    it('should build Prisma include object from attributes without friend or friendOf', () => {
      const attributes: Partial<Prisma.UserCreateInput> = {}
      const expected: Prisma.UserInclude = {}

      expect(userFactory.buildPrismaIncludeFromAttrs(attributes)).toEqual(expected)
    })

    it('should build Prisma include object from attributes with friend', () => {
      const attributes: Partial<Prisma.UserCreateInput> = {
        friend: {
          connect: {
            friendId_friendOfId: {
              friendId: 'friend_id',
              friendOfId: 'friend_of_id',
            },
          },
        },
      }
      const expected: Prisma.UserInclude = {
        friend: true,
      }

      expect(userFactory.buildPrismaIncludeFromAttrs(attributes)).toEqual(expected)
    })

    it('should build Prisma include object from attributes with friendOf', () => {
      const attributes: Partial<Prisma.UserCreateInput> = {
        friendOf: {
          connect: {
            friendId_friendOfId: {
              friendId: 'friend_id',
              friendOfId: 'friend_of_id',
            },
          },
        },
      }
      const expected: Prisma.UserInclude = {
        friendOf: true,
      }

      expect(userFactory.buildPrismaIncludeFromAttrs(attributes)).toEqual(expected)
    })
  })

  describe('create', () => {
    it('should create a user with default attributes', () => {
      const expected: Prisma.UserCreateArgs = {
        data: {
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {},
      }

      expect(userFactory.create()).toEqual(expected)
    })

    it('should create a user with custom attributes', () => {
      const attributes: Partial<Prisma.UserCreateInput> = {
        name: 'John Doe',
        email: 'john.doe@acme.com',
      }
      const expected: Prisma.UserCreateArgs = {
        data: {
          id: expect.any(String),
          name: 'John Doe',
          email: 'john.doe@acme.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {},
      }

      expect(userFactory.create(attributes)).toEqual(expected)
    })
  })
})
