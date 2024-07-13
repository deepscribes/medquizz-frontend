import client from "@/../prisma/db";
import { createUserIfNotExists } from "./createUserIfNotExists";
import { updateUserWrongQuestions } from "./questions";

export async function getUserTests(userId: string) {
  await createUserIfNotExists(userId);
  const res = await client.test.findMany({
    where: {
      userId,
    },
    include: {
      correctQuestions: {
        include: {
          answers: true,
        },
      },
      wrongQuestions: {
        include: {
          answers: true,
        },
      },
      notAnsweredQuestions: {
        include: {
          answers: true,
        },
      },
      answers: true,
    },
  });
  return res;
}

function doesArrayContainSomeElementOfArray<T>(
  array: T[],
  otherArray: T[]
): boolean {
  return otherArray.some((e) => array.includes(e));
}

export async function createUserTest(
  userId: string,
  type: string,
  score: number,
  maxScore: number,
  questionIds: number[],
  answerIds: number[]
) {
  if (!type || score == undefined || !maxScore) {
    throw new Error("Missing type or score or maxScore");
  }

  if (!questionIds || !answerIds) {
    throw new Error("Missing questionIds or answerIds");
  }

  if (
    Number.isNaN(parseInt(score.toString())) ||
    Number.isNaN(parseInt(maxScore.toString()))
  ) {
    throw new Error("Score or maxScore are not numbers");
  }

  await createUserIfNotExists(userId);

  // For each answer, get the corresponding question id
  const allAnsweredQuestions = await client.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    include: {
      answers: true,
    },
  });

  const correctQuestions = allAnsweredQuestions.filter((q) => {
    const correctAnswer = q.answers.find((a) => a.isCorrect);
    return correctAnswer && answerIds.includes(correctAnswer.id);
  });

  console.log(
    "Correct questions",
    correctQuestions.map((q) => q.id)
  );

  const wrongQuestions = allAnsweredQuestions.filter(
    (q) =>
      !correctQuestions.includes(q) &&
      doesArrayContainSomeElementOfArray(
        answerIds,
        q.answers.filter((a) => !a.isCorrect).map((a) => a.id)
      )
  );

  console.log(
    "Wrong questions",
    wrongQuestions.map((q) => q.id)
  );

  const notAnsweredQuestionIds = questionIds.filter(
    (id) =>
      !correctQuestions.map((q) => q.id).includes(id) &&
      !wrongQuestions.map((q) => q.id).includes(id)
  );

  console.log("Not answered questions", notAnsweredQuestionIds);

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
      notAnsweredQuestions: {
        connect: notAnsweredQuestionIds.map((id) => ({ id })),
      },
      answers: {
        connect: answerIds.map((a) => ({ id: a })),
      },
    },
  });

  await updateUserWrongQuestions(
    userId,
    type,
    correctQuestions,
    wrongQuestions
  );
}

export async function getUserTestsBySubject(subject: string, userId: string) {
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
    include: {
      correctQuestions: true,
      wrongQuestions: true,
      notAnsweredQuestions: true,
      answers: true,
    },
  });
}

export async function getUserTestsById(id: number, userId: string) {
  if (!id) {
    throw new Error("Missing id");
  }

  createUserIfNotExists(userId);

  return await client.test.findUnique({
    where: {
      userId: userId,
      id,
    },
    include: {
      correctQuestions: {
        include: {
          answers: true,
        },
      },
      wrongQuestions: {
        include: {
          answers: true,
        },
      },
      notAnsweredQuestions: {
        include: {
          answers: true,
        },
      },
      answers: true,
    },
  });
}
