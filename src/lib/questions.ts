import { PrismaClient } from "@prisma/client";
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

export async function fetchRandomQuestions(
  client: PrismaClient,
  subject: keyof SubjectQuestions,
  count: number
) {
  const questions = await client.$queryRaw<QuestionWithAnswers[]>`
    SELECT
      q.id,
      q.jsonid,
      q.question,
      q.subject,
      q.number,
      q."branoId",
      COALESCE(json_agg(json_build_object('id', a.id, 'text', a.text, 'isCorrect', a."isCorrect")) FILTER (WHERE a.id IS NOT NULL), '[]') AS answers
    FROM public."Question" q
    LEFT JOIN public."Answer" a ON q.jsonid = a."domandaId"
    WHERE q.subject = ${subject}
    GROUP BY q.id
    HAVING COUNT(*) > 0
    ORDER BY RANDOM()
    LIMIT ${count}`;
  return questions;
}

export async function fetchOrderedQuestions(
  client: PrismaClient,
  subject: keyof SubjectQuestions,
  from: number,
  to: number
) {
  const questions = await client.question.findMany({
    where: {
      subject,
      answers: {
        some: { isCorrect: true },
      },
      jsonid: {
        gte: from,
        lte: to,
      },
    },
    include: { answers: true },
  });
  return questions;
}

export async function fetchQuestions(
  client: PrismaClient,
  subject: keyof SubjectQuestions,
  subjectQuestions: Partial<SubjectQuestions>,
  isReduced: boolean,
  start: number | null = null,
  count: number | null = null
) {
  console.log(start, count);
  const questions = client.$queryRaw<QuestionWithAnswers[]>`
    SELECT
      q.id,
      q.jsonid,
      q.question,
      q.subject,
      q.number,
      q."branoId",
      COALESCE(json_agg(json_build_object('id', a.id, 'text', a.text, 'isCorrect', a."isCorrect")) FILTER (WHERE a.id IS NOT NULL), '[]') AS answers
    FROM public."Question" q
    LEFT JOIN public."Answer" a ON q.jsonid = a."domandaId"
    WHERE q.subject = ${subject}
    GROUP BY q.id
    HAVING COUNT(*) > 0
    ORDER BY ${start ? "q.jsonid ASC" : "RANDOM()"}
    LIMIT ${
      count ?? isReduced
        ? subjectQuestions[subject]?.rapido || 30
        : subjectQuestions[subject]?.completo || 30
    }
    `;
  return questions;
}
