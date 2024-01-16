import { PrismaClient } from '@prisma/client'

import { userSeed } from '@/database/clients/prisma/seeds/user.seed'

const seed = async (): Promise<void> => {
  const prismaClient = new PrismaClient()
  try {
    await userSeed(prismaClient)
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prismaClient.$disconnect()
  }
}

export default seed()
