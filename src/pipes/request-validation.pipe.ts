import { ValidationPipe } from '@nestjs/common'
import { ValidationError } from 'class-validator'

import { UnprocessableEntityException } from '@/exceptions/unprocessable-entity.exception'

export class RequestValidationPipe extends ValidationPipe {
  protected whitelist = true
  protected forbidNonWhitelisted = true

  exceptionFactory = (validationErrors: ValidationError[]) => {
    return new UnprocessableEntityException(validationErrors)
  }
}
