import { Logger } from '@nestjs/common'

import { bootstrap } from '@/bootstrap'

bootstrap({
  logger: new Logger('Bootstrap'),
})
