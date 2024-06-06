import client from "@/../prisma/db";

export async function createUserIfNotExists(userId: string) {
  if (!userId) throw new Error("userId is not defined");

  const user = await client.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  if (!user) {
    await client.user.create({
      data: {
        id: userId,
      },
    });
  }
}
