import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { Factory } from '@/database/factories/factory.interface'

@Injectable()
export class UserFactory implements Factory<Prisma.UserCreateInput, Prisma.UserCreateArgs, Prisma.UserInclude> {
  get defaultAttributes() {
    const now = new Date(Date.now())
    const name = faker.internet.userName().toLowerCase()
    const email = this.emailAttribute(name)
    const defaultAttributes: Partial<Prisma.UserCreateInput> = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: now,
      updatedAt: now,
    }

    return defaultAttributes
  }

  emailAttribute(name: string) {
    return name.replace(/\s/g, '.').toLowerCase() + '@' + faker.internet.domainName().toLowerCase()
  }

  build(attributes: Partial<Prisma.UserCreateInput> = {}) {
    if (attributes.name && !attributes.email) attributes.email = this.emailAttribute(attributes.name)

    return {
      ...this.defaultAttributes,
      ...attributes,
    } as Prisma.UserCreateInput
  }

  buildPrismaIncludeFromAttrs = (attributes: Partial<Prisma.UserCreateInput>) => {
    const includes: Prisma.UserInclude = {}
    if (attributes.friend) includes.friend = true
    if (attributes.friendOf) includes.friendOf = true

    return includes
  }

  create(attributes: Partial<Prisma.UserCreateInput> = {}) {
    const user = this.build(attributes)
    const include = this.buildPrismaIncludeFromAttrs(attributes)
    const createArgs: Prisma.UserCreateArgs = {
      data: user,
      include,
    }

    return createArgs
  }
}
