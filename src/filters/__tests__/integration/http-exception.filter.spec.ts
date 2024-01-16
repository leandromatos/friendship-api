import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { Response } from 'express'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { BaseException } from '@/exceptions/base.exception'
import { exceptionNameToType } from '@/exceptions/utils/exception-name-to-type'
import { HttpExceptionFilter } from '@/filters/http-exception.filter'

describe('HttpExceptionFilter', () => {
  let app: NestApplication
  let host: ArgumentsHost
  let response: Response
  let httpExceptionFilter: HttpExceptionFilter

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    })
      .setLogger(new EmptyLogger())
      .compile()
    app = moduleFixture.createNestApplication()
    app.useGlobalFilters(new HttpExceptionFilter())
    httpExceptionFilter = app.get<HttpExceptionFilter>(HttpExceptionFilter)
  })

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response
    host = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(response),
    } as unknown as ArgumentsHost
  })

  afterAll(async () => {
    await app.close()
  })

  it('should handle HttpException and return the appropriate response', () => {
    const message = 'Test not found exception'
    const statusCode = HttpStatus.BAD_REQUEST
    const exception = new HttpException(message, statusCode)
    const type = exceptionNameToType(exception.name)
    const body = {
      statusCode,
      type,
      message,
    }

    httpExceptionFilter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(statusCode)
    expect(response.json).toHaveBeenCalledWith(body)
  })

  it('should handle CustomException extending BaseException and return the appropriate response', () => {
    class CustomException extends BaseException {
      constructor(message: string, statusCode: HttpStatus, data?: object) {
        super({ statusCode, message, data })
      }
    }
    const message = 'Test exception'
    const statusCode = HttpStatus.BAD_REQUEST
    const data = { test: 'test' }
    const exception = new CustomException(message, statusCode, data)
    const type = exceptionNameToType(exception.name)
    const body = {
      statusCode,
      type,
      message,
      data,
    }

    httpExceptionFilter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(statusCode)
    expect(response.json).toHaveBeenCalledWith(body)
  })
})
