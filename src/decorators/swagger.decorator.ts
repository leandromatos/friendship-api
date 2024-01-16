import { applyDecorators } from '@nestjs/common'

export const ApiDocs = (decorators: MethodDecorator[]) => applyDecorators(...decorators)
