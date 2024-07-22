import client from "@/../prisma/db";
import { User } from "@prisma/client";

export async function createUserIfNotExists(userId: string): Promise<User> {
  if (!userId) throw new Error("userId is not defined");

  const user = await client.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (user) {
    return user;
  }
  return await client.user.create({
    data: {
      id: userId,
    },
  });
}
