import { BadRequestException, ClassSerializerInterceptor, HttpStatus, VersioningType } from '@nestjs/common'
import { NestApplication, NestFactory, Reflector } from '@nestjs/core'
import { Prisma, User } from '@prisma/client'
import request from 'supertest'

import { AppModule } from '@/app/app.module'
import { DatabaseService } from '@/database/database.service'
import { UserFactory } from '@/database/factories/user.factory'
import { UnprocessableEntityException } from '@/exceptions/unprocessable-entity.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'
import { HttpExceptionFilter } from '@/filters/http-exception.filter'
import { RequestValidationPipe } from '@/pipes/request-validation.pipe'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'

describe('Users (e2e)', () => {
  let app: NestApplication
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
    app = await NestFactory.create(AppModule, {
      logger: false,
    })
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    app.useGlobalPipes(new RequestValidationPipe())
    app.useGlobalFilters(new HttpExceptionFilter())
    app.enableVersioning({ type: VersioningType.URI })
    databaseService = app.get<DatabaseService>(DatabaseService)
    await app.listen(process.env.PORT)
  })

  beforeEach(async () => {
    await databaseService.friends.deleteMany({})
    await databaseService.user.deleteMany({})
  })

  afterAll(async () => {
    await app.close()
  })

  describe('/v1/users (POST)', () => {
    it('should return a 422 error if the user tries to create a user with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .send({
          email: 'invalid_email',
        })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)

      expect(response.body).toHaveProperty('type', exceptionNameToType(UnprocessableEntityException.name))
    })

    it('should create a user and return a 201 status code', async () => {
      const createUserRequest = {
        name: 'John Doe',
        email: 'john.doe@acme.com',
      }

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .send(createUserRequest)
        .expect(HttpStatus.CREATED)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', createUserRequest.name)
      expect(response.body).toHaveProperty('email', createUserRequest.email)
    })
  })

  describe('/v1/users (GET)', () => {
    it('should return a 200 status code with a empty list of users', async () => {
      const response = await request(app.getHttpServer()).get('/v1/users').expect(HttpStatus.OK)

      expect(response.body).toHaveLength(0)
    })

    it('should return a 200 status code with a list of users', async () => {
      const users = await Promise.all([
        createUser(databaseService),
        createUser(databaseService),
        createUser(databaseService),
      ])

      const response = await request(app.getHttpServer()).get('/v1/users').expect(HttpStatus.OK)

      expect(response.body).toHaveLength(users.length)
    })
  })

  describe('/v1/users/:userId (GET)', () => {
    it('should return a 200 status code with a user', async () => {
      const user = await createUser(databaseService)

      const response = await request(app.getHttpServer()).get(`/v1/users/${user.id}`).expect(HttpStatus.OK)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', user.name)
      expect(response.body).toHaveProperty('email', user.email)
    })

    it('should return a 404 error if the user does not exist', async () => {
      await createUser(databaseService)
      const nonExistentUserId = 'non_existent_user_id'

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${nonExistentUserId}`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body).toHaveProperty('type', exceptionNameToType(UserNotFoundException.name))
    })
  })

  describe('/v1/users/:userId (PATCH)', () => {
    it('should return a 200 status code with a updated user', async () => {
      const user = await createUser(databaseService)
      const updateUserRequest = {
        name: 'John Doe',
      }

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .send(updateUserRequest)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', updateUserRequest.name)
      expect(response.body).toHaveProperty('email', user.email)
    })

    it('should return a 422 error if the user tries to update a user with invalid data', async () => {
      const user = await createUser(databaseService, {
        name: 'John Doe',
        email: 'john.doe@acme.com',
      })

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .send({
          email: '',
        })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)

      expect(response.body).toHaveProperty('type', exceptionNameToType(UnprocessableEntityException.name))
    })

    it('should return a 404 error if the user does not exist', async () => {
      await createUser(databaseService)
      const nonExistentUserId = 'non_existent_user_id'

      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${nonExistentUserId}`)
        .send({
          name: 'John',
        })
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body).toHaveProperty('type', exceptionNameToType(UserNotFoundException.name))
    })
  })

  describe('/v1/users/:userId (DELETE)', () => {
    it('should return a 200 status code', async () => {
      const user = await createUser(databaseService)

      const response = await request(app.getHttpServer()).delete(`/v1/users/${user.id}`).expect(HttpStatus.OK)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', user.name)
      expect(response.body).toHaveProperty('email', user.email)
      await expect(databaseService.user.findUnique({ where: { id: user.id } })).resolves.toBeNull()
    })

    it('should return a 404 error if the user does not exist', async () => {
      await createUser(databaseService)
      const nonExistentUserId = 'non_existent_user_id'

      const response = await request(app.getHttpServer())
        .delete(`/v1/users/${nonExistentUserId}`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body).toHaveProperty('type', exceptionNameToType(UserNotFoundException.name))
    })
  })

  describe('/v1/users/:userId/friends (GET)', () => {
    it('should return a 200 status code with a empty list of friends if the user does not have friends', async () => {
      const user = await createUser(databaseService)

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${user.id}/friends?degree=1`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveLength(0)
    })

    it('should return a 200 status code with a list of friends by first degree', async () => {
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

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${user.id}/friends?degree=1`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveLength(3)
      const responseIds = response.body.map(user => user.id)
      const friendsIds = friends.map(friend => friend.id)
      expect(responseIds).toEqual(expect.arrayContaining(friendsIds))
    })

    it('should return a 200 status code with a list of friends by second degree', async () => {
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

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${user.id}/friends?degree=2`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveLength(3)
      const responseIds = response.body.map(user => user.id)
      const friendsIds = [friends.at(3).id, friends.at(4).id, friends.at(5).id]
      expect(responseIds).toEqual(expect.arrayContaining(friendsIds))
    })

    it('should return a 200 status code with a list of friends by third degree', async () => {
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

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${user.id}/friends?degree=3`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveLength(3)
      const responseIds = response.body.map(user => user.id)
      const friendsIds = [friends.at(6).id, friends.at(7).id, friends.at(8).id]
      expect(responseIds).toEqual(expect.arrayContaining(friendsIds))
    })

    it('should return a 400 error if the user tries to get friends with invalid data', async () => {
      const user = await createUser(databaseService)

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${user.id}/friends?degree=invalid_degree`)
        .expect(HttpStatus.BAD_REQUEST)

      expect(response.body).toHaveProperty('type', exceptionNameToType(BadRequestException.name))
    })
  })
})
