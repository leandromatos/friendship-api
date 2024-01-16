import { NestApplication } from '@nestjs/core'

import { EmptyLogger } from '@/__tests__/utils/empty-logger'
import { bootstrap } from '@/bootstrap'

describe('AppModule', () => {
  let app: NestApplication

  beforeAll(async () => {
    app = await bootstrap({
      logger: new EmptyLogger(),
    })
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined and running on the correct port', () => {
    const port = app.getHttpServer().address().port
    const expectedPort = process.env.PORT

    expect(port).toBe(Number(expectedPort))
  })
})
