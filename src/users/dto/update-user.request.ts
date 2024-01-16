import { PartialType } from '@nestjs/swagger'

import { CreateUserRequest } from '@/users/dto/create-user.request'

export class UpdateUserRequest extends PartialType(CreateUserRequest) {}
