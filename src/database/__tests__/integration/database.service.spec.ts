import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { DatabaseModule } from '@/database/database.module'
import { DatabaseService } from '@/database/database.service'

describe('DatabaseService', () => {
  let app: NestApplication
  let databaseService: DatabaseService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
    })
      .setLogger(new EmptyLogger())
      .compile()
    app = moduleFixture.createNestApplication()
    databaseService = app.get<DatabaseService>(DatabaseService)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('onModuleInit', () => {
    it('should call $connect method', async () => {
      jest.spyOn(databaseService, '$connect')

      await databaseService.onModuleInit()

      expect(databaseService.$connect).toHaveBeenCalled()
    })

    it('should connect to the database', async () => {
      await expect(databaseService.$connect()).resolves.not.toThrow()
    })
  })

  describe('onModuleDestroy', () => {
    it('should disconnect from the database', async () => {
      await expect(databaseService.$disconnect()).resolves.not.toThrow()
    })
  })
})
