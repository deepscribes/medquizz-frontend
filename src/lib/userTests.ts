import client from "@/../prisma/db";
import { createUserIfNotExists } from "./createUserIfNotExists";

export async function getUserTests(userId: string) {
  await createUserIfNotExists(userId);
  const res = await client.test.findMany({
    where: {
      userId,
    },
    include: {
      questions: true,
    },
  });
  return res;
}

export async function createUserTest(
  userId: string,
  type: string,
  score: number,
  maxScore: number
) {
  if (!type || score == undefined || !maxScore) {
    throw new Error("Missing type or score or maxScore");
  }

  if (
    Number.isNaN(parseInt(score.toString())) ||
    Number.isNaN(parseInt(maxScore.toString()))
  ) {
    throw new Error("Score or maxScore are not numbers");
  }

  await createUserIfNotExists(userId);

  await client.test.create({
    data: {
      userId,
      type,
      score,
      maxScore,
    },
  });
}

export async function getUserTestsWithSubject(subject: string, userId: string) {
  if (!subject) {
    throw new Error("Missing subject");
  }

  createUserIfNotExists(userId);

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
