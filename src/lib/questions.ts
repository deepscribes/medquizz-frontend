import client from "@/../prisma/db";
import type { Answer, Question } from "@prisma/client";

export const subjectQuestions = {
  lettura: {
    completo: 4,
    rapido: 2,
  },
  logica: {
    completo: 5,
    rapido: 3,
  },
  biologia: {
    completo: 23,
    rapido: 11,
  },
  chimica: {
    completo: 15,
    rapido: 7,
  },
  fisica: {
    completo: 13,
    rapido: 7,
  },
} as const;

export type SubjectQuestions = typeof subjectQuestions;

export type QuestionWithAnswers = Question & { answers: Answer[] };

export async function updateUserWrongQuestions(
  userId: string,
  testType: string,
  correctAnswers: number[],
  wrongAnswers: number[]
) {
  if (
    !correctAnswers.every((id) => typeof id === "number") ||
    !wrongAnswers.every((id) => typeof id === "number")
  ) {
    throw new Error("Invalid questionId");
  }

  if (!userId) {
    throw new Error("Invalid userId");
  }

  const correctQuestionIds = await client.question.findMany({
    where: {
      answers: {
        some: {
          id: {
            in: correctAnswers,
          },
        },
      },
    },
  });

  const wrongQuestionIds = await client.question.findMany({
    where: {
      answers: {
        some: {
          id: {
            in: wrongAnswers,
          },
        },
      },
    },
  });

  // Add the wrong questions to the user's wrong questions
  await client.user.update({
    where: { id: userId },
    data: {
      wrongQuestions: {
        connect: wrongQuestionIds.map((q) => ({ id: q.id })),
      },
    },
  });

  // Remove the correct questions from the wrong questions
  if (testType == "ripasso") {
    await client.user.update({
      where: { id: userId },
      data: {
        wrongQuestions: {
          disconnect: correctQuestionIds.map((q) => ({ id: q.id })),
        },
      },
    });
  }
}

async function getPastQuestionsFromUser(userId: string) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      tests: {
        select: {
          correctQuestions: true,
          wrongQuestions: true,
        },
      },
    },
  });
  const pastQuestions = user?.tests
    .map((t) =>
      t.correctQuestions
        .map((q) => q.id)
        .concat(t.wrongQuestions.map((q) => q.id))
    )
    .flat();

  return pastQuestions || [];
}

export async function getWrongQuestionsFromUser(userId: string) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      wrongQuestions: {
        include: { answers: true },
      },
    },
  });
  const wrongQuestions = user?.wrongQuestions || [];

  return wrongQuestions || [];
}

/**
 * Fetches a random subset of questions with the given subject
 * @param subject The subject to fetch questions from
 * @param count How many questions to fetch at most (not guaranteed)
 * @param excludePastQuestions Whether to exclude the user's past questions
 * @param userId The user's userId
 * @returns A list of the fetched questions
 */
export async function fetchRandomQuestionsFromSubject(
  subject: keyof SubjectQuestions,
  count: number,
  userId: string | null
): Promise<QuestionWithAnswers[]> {
  console.log(
    `Fetching ${count} questions from ${subject}, excluding past questions from ${userId}...`
  );
  const pastQuestions = userId ? await getPastQuestionsFromUser(userId) : [];
  const questions = await client.question.findMany({
    where: {
      subject,
      answers: {
        some: { isCorrect: true },
      },
    },
    include: {
      answers: true,
    },
  });
  // Remove past questions, if they exist
  if (userId) {
    questions.filter((q) => !pastQuestions.includes(q.id));
  }
  // Return a randomized subset of questions
  return questions.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Fetches a list of questions with the given subject, ordered by question number, from a given range
 * @param subject The subject to fetch questions from
 * @param from The starting question number
 * @param to The end question number
 * @param userId The user id of the user to exclude past questions from, or null to include all questions
 * @returns A list of questions with the given subject, ordered by question number
 */
export async function fetchOrderedQuestionsFromSubject(
  subject: keyof SubjectQuestions,
  from: number,
  to: number,
  userId: string | null
): Promise<QuestionWithAnswers[]> {
  const pastQuestions = userId ? await getPastQuestionsFromUser(userId) : [];
  const questions = await client.question.findMany({
    where: {
      subject,
      answers: {
        some: { isCorrect: true },
      },
      number: {
        gte: from,
        lte: to,
      },
    },
    include: { answers: true },
    orderBy: { id: "asc" },
  });
  questions.filter((q) => !pastQuestions.includes(q.id));
  return questions;
}
