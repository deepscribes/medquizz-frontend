import client from "@/../prisma/db";

export async function getUserTrend(subject: string, userId: string) {
  if (!subject) {
    throw new Error("Missing subject");
  }

  return await client.test.findMany({
    where: {
      userId: userId,
      type: subject,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
