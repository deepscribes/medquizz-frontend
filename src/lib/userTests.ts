// @ts-nocheck
import client from "@/../prisma/db";
import { createUserIfNotExists } from "./createUserIfNotExists";
import { updateUserWrongQuestions } from "./questions";
import type { UserTestWithQuestionsAndAnswers } from "@/types";
import type { Answer } from "@/types/db";
import type { QuestionWithAnswers } from "./questions";

function doesArrayContainSomeElementOfArray<T>(array: T[], otherArray: T[]): boolean {
  return otherArray.some((e) => array.includes(e));
}

function extractIds(field: any): number[] {
  if (!field) return [];
  if (Array.isArray(field)) {
    return field.map((c: any) => (typeof c === "number" ? c : c.id));
  }
  if (Array.isArray(field.connect)) {
    return field.connect.map((c: any) => (typeof c === "number" ? c : c.id));
  }
  return [];
}

async function hydrateQuestions(ids: number[]): Promise<QuestionWithAnswers[]> {
  const results = await Promise.all(
    ids.map((id) => client.question.findMany({ where: { id } }))
  );
  return results.map((r) => r[0]).filter(Boolean) as QuestionWithAnswers[];
}

async function hydrateTest(test: any): Promise<UserTestWithQuestionsAndAnswers> {
  const correctIds = extractIds(test.correctQuestions);
  const wrongIds = extractIds(test.wrongQuestions);
  const notAnsweredIds = extractIds(test.notAnsweredQuestions);
  const questionIds = Array.from(new Set([...correctIds, ...wrongIds, ...notAnsweredIds]));
  const questions = await hydrateQuestions(questionIds);
  const questionMap = new Map<number, QuestionWithAnswers>();
  questions.forEach((q) => questionMap.set(q.id, q));
  const answerMap = new Map<number, Answer>();
  questions.forEach((q) => q.answers?.forEach((a) => answerMap.set(a.id, a)));
  const answers: Answer[] = Array.isArray(test.answers)
    ? test.answers
        .map((a: any) => (typeof a === "number" ? answerMap.get(a)! : a))
        .filter(Boolean)
    : [];
  return {
    ...test,
    correctQuestions: correctIds
      .map((id) => questionMap.get(id))
      .filter(Boolean) as QuestionWithAnswers[],
    wrongQuestions: wrongIds
      .map((id) => questionMap.get(id))
      .filter(Boolean) as QuestionWithAnswers[],
    notAnsweredQuestions: notAnsweredIds
      .map((id) => questionMap.get(id))
      .filter(Boolean) as QuestionWithAnswers[],
    answers,
  };
}

export async function getUserTests(
  userId: string
): Promise<UserTestWithQuestionsAndAnswers[]> {
  await createUserIfNotExists(userId);
  const tests = await client.test.findMany({ where: { userId } });
  return Promise.all(tests.map(hydrateTest));
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

  // Fetch all answered questions individually
  const allAnsweredQuestions = (
    await Promise.all(
      questionIds.map((id) => client.question.findMany({ where: { id } }))
    )
  )
    .map((r) => r[0])
    .filter(Boolean);

  const correctQuestions = allAnsweredQuestions.filter((q) => {
    const correctAnswer = q.answers.find((a) => a.isCorrect);
    return correctAnswer && answerIds.includes(correctAnswer.id);
  });

  const wrongQuestions = allAnsweredQuestions.filter(
    (q) =>
      !correctQuestions.includes(q) &&
      doesArrayContainSomeElementOfArray(
        answerIds,
        q.answers.filter((a) => !a.isCorrect).map((a) => a.id)
      )
  );

  const notAnsweredQuestionIds = questionIds.filter(
    (id) =>
      !correctQuestions.map((q) => q.id).includes(id) &&
      !wrongQuestions.map((q) => q.id).includes(id)
  );

  const givenAnswers = allAnsweredQuestions
    .flatMap((q) => q.answers.filter((a) => answerIds.includes(a.id)))
    .map((a) => ({ ...a }));

  await client.test.create({
    data: {
      userId,
      type,
      score,
      maxScore,
      correctQuestions: correctQuestions.map((q) => q.id),
      wrongQuestions: wrongQuestions.map((q) => q.id),
      notAnsweredQuestions: notAnsweredQuestionIds,
      answers: givenAnswers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  await updateUserWrongQuestions(
    userId,
    type,
    correctQuestions,
    wrongQuestions
  );
}

export async function getUserTestsBySubject(
  subject: string,
  userId: string
): Promise<UserTestWithQuestionsAndAnswers[] | null> {
  if (!subject) {
    throw new Error("Missing subject");
  }

  await createUserIfNotExists(userId);

  const tests = await client.test.findMany({
    where: {
      userId,
      type: subject,
    },
  });
  const hydrated = await Promise.all(tests.map(hydrateTest));
  return hydrated.sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );
}

export async function getUserTestsById(
  id: string,
  userId: string
): Promise<UserTestWithQuestionsAndAnswers | null> {
  if (!id) {
    throw new Error("Missing id");
  }

  await createUserIfNotExists(userId);

  const test = await client.test.findUnique({
    where: {
      id,
      userId,
    },
  });
  if (!test) return null;
  return hydrateTest(test);
}

