import { HttpStatus } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { ValidationError } from 'class-validator'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { UnprocessableEntityException } from '@/exceptions/unprocessable-entity.exception'
import { RequestValidationPipe } from '@/pipes/request-validation.pipe'

describe('RequestValidationPipe', () => {
  let app: NestApplication
  let validationPipe: RequestValidationPipe

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [RequestValidationPipe],
    })
      .setLogger(new EmptyLogger())
      .compile()
    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new RequestValidationPipe())
    validationPipe = app.get<RequestValidationPipe>(RequestValidationPipe)
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return RequestValidationException', () => {
    const validationErrors: ValidationError[] = [
      { property: 'name', constraints: { isNotEmpty: 'name should not be empty' } },
    ]
    const statusCode = HttpStatus.UNPROCESSABLE_ENTITY
    const message = 'Request validation error'
    const data = {
      errors: [{ field: 'name', rule: 'IS_NOT_EMPTY', message: 'name should not be empty' }],
    }

    const exception = validationPipe.exceptionFactory(validationErrors)
    const exceptionResponse = exception.getResponse()

    expect(exception).toBeInstanceOf(UnprocessableEntityException)
    expect(exceptionResponse).toHaveProperty('statusCode', statusCode)
    expect(exceptionResponse).toHaveProperty('message', message)
    expect(exceptionResponse).toHaveProperty('data', data)
  })
})
