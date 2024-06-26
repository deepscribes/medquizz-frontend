import client from "@/../prisma/db";
import type { Answer, Question } from "@prisma/client";

export const subjectQuestions = {
  "competenze di lettura e conoscenze acquisite negli studi": {
    completo: 4,
    rapido: 2,
  },
  "ragionamento logico e problemi": {
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
  "fisica e matematica": {
    completo: 13,
    rapido: 7,
  },
} as const;

export type SubjectQuestions = typeof subjectQuestions;

export type QuestionWithAnswers = Question & { answers: Answer[] };

async function getPastQuestionsFromUser(userId: string) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      tests: {
        select: {
          questions: true,
        },
      },
    },
  });
  const pastQuestions = user?.tests
    .map((t) => t.questions.map((q) => q.id))
    .flat();

  return pastQuestions || [];
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
  questions.filter((q) => !pastQuestions.includes(q.id));
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
    orderBy: { jsonid: "asc" },
  });
  questions.filter((q) => !pastQuestions.includes(q.id));
  return questions;
}
