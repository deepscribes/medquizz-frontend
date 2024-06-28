import client from "@/../prisma/db";
import { createUserIfNotExists } from "./createUserIfNotExists";

export async function getUserTests(userId: string) {
  await createUserIfNotExists(userId);
  const res = await client.test.findMany({
    where: {
      userId,
    },
    include: {
      correctQuestions: true,
      wrongQuestions: true,
    },
  });
  return res;
}

export async function createUserTest(
  userId: string,
  type: string,
  score: number,
  maxScore: number,
  correctAnswers: number[],
  wrongAnswers: number[]
) {
  if (!type || score == undefined || !maxScore) {
    throw new Error("Missing type or score or maxScore");
  }

  if (!correctAnswers || !wrongAnswers) {
    throw new Error("Missing correctQuestions or wrongQuestions");
  }

  if (
    Number.isNaN(parseInt(score.toString())) ||
    Number.isNaN(parseInt(maxScore.toString()))
  ) {
    throw new Error("Score or maxScore are not numbers");
  }

  await createUserIfNotExists(userId);

  // For each answer, get the corresponding question id
  const correctQuestions = (
    await client.answer.findMany({
      where: {
        id: {
          in: correctAnswers,
        },
      },
      include: {
        domanda: true,
      },
    })
  ).map((a) => a.domanda);

  const wrongQuestions = (
    await client.answer.findMany({
      where: {
        id: {
          in: wrongAnswers,
        },
      },
      include: {
        domanda: true,
      },
    })
  ).map((a) => a.domanda);

  const correctAnswersIds = correctQuestions.map((q) => q.id);
  const wrongAnswersIds = wrongQuestions.map((q) => q.id);

  if (
    correctAnswers.length !== correctAnswersIds.length ||
    wrongAnswers.length !== wrongAnswersIds.length
  ) {
    console.log(
      correctAnswers,
      correctAnswersIds,
      wrongAnswers,
      wrongAnswersIds
    );
    throw new Error("Some answers are not valid");
  }

  console.log(correctAnswersIds, wrongAnswersIds);

  await client.test.create({
    data: {
      userId,
      type,
      score,
      maxScore,
      correctQuestions: {
        connect: correctQuestions.map((q) => ({ id: q.id })),
      },
      wrongQuestions: {
        connect: wrongQuestions.map((q) => ({ id: q.id })),
      },
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
