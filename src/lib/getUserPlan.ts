import { auth } from "@clerk/nextjs/server";

import client from "@/../prisma/db";
import { Plan } from "@prisma/client";

export async function getUserPlan() {
  const { userId } = auth();

  if (!userId) {
    return Plan.BASIC;
  }

  return (
    (
      await client.user.findUnique({
        where: {
          id: userId,
        },
      })
    )?.plan || Plan.BASIC
  );
}
