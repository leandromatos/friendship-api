import { Logger, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from '@/app.module'

async function bootstrap() {
  const logger = new Logger('bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger,
  })
  app.enableVersioning({ type: VersioningType.URI })
  const swaggerDocumentConfig = new DocumentBuilder()
    .setTitle('CouchSurfing - Friendship API')
    .setDescription('')
    .setVersion('1.0')
    .build()
  const swaggerDocumentOptions: SwaggerDocumentOptions = {
    extraModels: [],
  }
  const swaggerCustomOptions: SwaggerCustomOptions = {
    customSiteTitle: 'CouchSurfing - Friendship API',
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  }
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerDocumentConfig, swaggerDocumentOptions)
  SwaggerModule.setup('docs', app, swaggerDocument, swaggerCustomOptions)
  await app.listen(process.env.PORT)
  const port = app.getHttpServer().address().port
  logger.log(`API running on http://localhost:${port}`)
  logger.log(`API documentation running on http://localhost:${port}/docs`)
}
bootstrap()
