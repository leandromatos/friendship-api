import { PrismaClient } from '@prisma/client'

import { UserFactory } from '@/database/factories/user.factory'

export const userSeed = async (prismaClient: PrismaClient) => {
  const userFactory = new UserFactory()

  const createUsers = async (): Promise<void> => {
    const alice = userFactory.create({
      name: 'Alice',
    })
    const bob = userFactory.create({
      name: 'Bob',
    })
    const charlie = userFactory.create({
      name: 'Charlie',
    })
    const david = userFactory.create({
      name: 'David',
    })
    const eve = userFactory.create({
      name: 'Eve',
    })
    await Promise.all([
      prismaClient.user.create(alice),
      prismaClient.user.create(bob),
      prismaClient.user.create(charlie),
      prismaClient.user.create(david),
      prismaClient.user.create(eve),
    ])
    // Establishing bi-directional Friendships
    // ---------------------------------------
    // Alice:
    // 1st Degree Friends: Bob (directly connected to Alice)
    // 2nd Degree Friends: Charlie (friend of Bob, not directly connected to Alice)
    // 3rd Degree Friends: David (friend of Charlie, not directly connected to Alice or Bob)
    // ---------------------------------------
    // Bob:
    // 1st Degree Friends: Alice, Charlie
    // 2nd Degree Friends: David (friend of Charlie)
    // 3rd Degree Friends: Eve (friend of David)
    // ---------------------------------------
    // Charlie:
    // 1st Degree Friends: Bob, David
    // 2nd Degree Friends: Alice (friend of Bob), Eve (friend of David)
    // 3rd Degree Friends: None in the current setup
    // ---------------------------------------
    // David:
    // 1st Degree Friends: Charlie, Eve
    // 2nd Degree Friends: Bob (friend of Charlie)
    // 3rd Degree Friends: Alice (friend of Bob)
    // ---------------------------------------
    // Eve:
    // 1st Degree Friends: David
    // 2nd Degree Friends: Charlie (friend of David)
    // 3rd Degree Friends: Bob (friend of Charlie)
    // ---------------------------------------
    // Alice - Bob
    await Promise.all([
      prismaClient.friends.create({
        data: {
          friendId: alice.data.id,
          friendOfId: bob.data.id,
        },
      }),
      prismaClient.friends.create({
        data: {
          friendId: bob.data.id,
          friendOfId: alice.data.id,
        },
      }),
    ])

    // Bob - Charlie
    await Promise.all([
      prismaClient.friends.create({
        data: {
          friendId: bob.data.id,
          friendOfId: charlie.data.id,
        },
      }),
      prismaClient.friends.create({
        data: {
          friendId: charlie.data.id,
          friendOfId: bob.data.id,
        },
      }),
    ])

    // Charlie - David
    await Promise.all([
      prismaClient.friends.create({
        data: {
          friendId: charlie.data.id,
          friendOfId: david.data.id,
        },
      }),
      prismaClient.friends.create({
        data: {
          friendId: david.data.id,
          friendOfId: charlie.data.id,
        },
      }),
    ])

    // David - Eve
    await Promise.all([
      prismaClient.friends.create({
        data: {
          friendId: david.data.id,
          friendOfId: eve.data.id,
        },
      }),
      prismaClient.friends.create({
        data: {
          friendId: eve.data.id,
          friendOfId: david.data.id,
        },
      }),
    ])
  }

  await createUsers()
}
