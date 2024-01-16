import { BadRequestException, ClassSerializerInterceptor, VersioningType } from '@nestjs/common'
import { NestApplication, NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from '@/app/app.module'
import { UnprocessableEntityException } from '@/exceptions/unprocessable-entity.exception'
import { HttpExceptionFilter } from '@/filters/http-exception.filter'
import { RequestValidationPipe } from '@/pipes/request-validation.pipe'
import { UserNotFoundException } from '@/users/exceptions/user.not-found.exception'

export const bootstrap = async ({ logger }): Promise<NestApplication> => {
  const app: NestApplication = await NestFactory.create(AppModule, {
    logger,
  })
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.useGlobalPipes(new RequestValidationPipe())
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableVersioning({ type: VersioningType.URI })
  app.enableShutdownHooks()
  const swaggerDocumentConfig = new DocumentBuilder()
    .setTitle('Friendship API')
    .setDescription(
      'This is a simple API for managing friendships between users. This API is only for demonstration purposes.',
    )
    .setVersion('1.0')
    .build()
  const swaggerDocumentOptions: SwaggerDocumentOptions = {
    extraModels: [BadRequestException, UnprocessableEntityException, UserNotFoundException],
  }
  const swaggerCustomOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Friendship API',
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  }
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerDocumentConfig, swaggerDocumentOptions)
  SwaggerModule.setup('docs', app, swaggerDocument, swaggerCustomOptions)
  await app.listen(process.env.PORT)
  const port = app.getHttpServer().address().port
  logger.log(`API running on http://localhost:${port}`)
  logger.log(`API documentation running on http://localhost:${port}/docs`)

  return app
}
