import client, { docClient, TABLE_NAME } from "@/../prisma/db";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Answer, Question } from "@/types/db";

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
  correctQuestions: QuestionWithAnswers[],
  wrongQuestions: QuestionWithAnswers[]
) {
  if (!correctQuestions || !wrongQuestions || !testType) {
    throw new Error("Invalid questions or testType");
  }

  if (!userId) {
    throw new Error("Invalid userId");
  }

  const user = await client.user.findUnique({ where: { id: userId } });
  const wrongIds = new Set<number>(user?.wrongQuestionIds || []);
  wrongQuestions.forEach((q) => wrongIds.add(q.id));
  if (testType === "ripasso") {
    correctQuestions.forEach((q) => wrongIds.delete(q.id));
  }
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { pk: `USER#${userId}` },
      UpdateExpression: "SET wrongQuestionIds = :w",
      ExpressionAttributeValues: { ":w": Array.from(wrongIds) },
    })
  );
}

async function getPastQuestionsFromUser(userId: string) {
  const tests = await client.test.findMany({ where: { userId } });
  return (
    tests
      .map((t: any) =>
        (t.correctQuestions || []).concat(t.wrongQuestions || [])
      )
      .flat() || []
  );
}

export async function getWrongQuestionsFromUser(userId: string) {
  const user = await client.user.findUnique({ where: { id: userId } });
  const ids: number[] = user?.wrongQuestionIds || [];
  const results = await Promise.all(
    ids.map((id) => client.question.findMany({ where: { id } }))
  );
  return results.map((r) => r[0]).filter(Boolean) as QuestionWithAnswers[];
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
    `Fetching ${count} questions from ${subject} ${
      userId ? "excluding past questions from " + userId : ""
    }...`
  );
  const userPastQuestions = userId
    ? await getPastQuestionsFromUser(userId)
    : [];
  let questions = (await client.question.findMany({
    where: {
      subject,
    },
  })) as QuestionWithAnswers[];
  console.log(`Fetched ${questions.length} questions before filtering...`);
  // Remove past questions, if they exist
  if (userId) {
    questions = questions.filter((q) => !userPastQuestions.includes(q.id));
  }
  console.log(`${questions.length} questions after filtering...`);
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
  let questions = (await client.question.findMany({
    where: {
      subject,
      number: { gte: from, lte: to },
    },
  })) as QuestionWithAnswers[];
  questions = questions.filter((q) => !pastQuestions.includes(q.id));
  return questions.sort((a, b) => a.number - b.number);
}
