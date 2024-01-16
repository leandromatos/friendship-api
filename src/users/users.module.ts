import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database.module'
import { UserController } from '@/users/users.controller'
import { UsersRepository } from '@/users/users.repository'
import { UsersService } from '@/users/users.service'

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
