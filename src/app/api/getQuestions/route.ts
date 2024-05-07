import { Answer, Question } from "@prisma/client";
import client from "@/../prisma/db";
import { NextRequest, NextResponse } from "next/server";

type QuestionWithAnswers = Question & { answers: Answer[] };

// Key-value pair of subjects and the number of questions to fetch for each, for example, 15 questions for chemistry, ...
const subjectQuestions = {
  "competenze di lettura e conoscenze acquisite negli studi": 4,
  "ragionamento logico e problemi": 5,
  biologia: 23,
  chimica: 15,
  "fisica e matematica": 13,
} as const;
type Subject = keyof typeof subjectQuestions;

async function fetchQuestions(
  subject: string,
  subjectQuestions: Record<string, number>
) {
  const questions = client.$queryRaw<QuestionWithAnswers[]>`SELECT
    q.id,
    q.jsonid,
    q.question,
    q.subject,
    q.number,
    q."branoId",
    COALESCE(json_agg(json_build_object('id', a.id, 'text', a.text, 'isCorrect', a."isCorrect")) FILTER (WHERE a.id IS NOT NULL), '[]') AS answers
  FROM public."Question" q
  LEFT JOIN public."Answer" a ON q.id = a."domandaId"
  WHERE q.subject = ${subject}
  GROUP BY q.id, q.jsonid, q.question, q.subject, q.number, q."branoId"
  HAVING COUNT(a.id) > 0
  ORDER BY RANDOM()
  LIMIT ${subjectQuestions[subject]}
  `;
  return questions;
}

export async function GET(req: NextRequest) {
  // Get cursors from query params
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  const cursorsParam = queryParams.get("cursors");

  const res: QuestionWithAnswers[] = [];
  // cursors is an array of numbers, if set, or an empty array if not
  const cursors: number[] = cursorsParam
    ? cursorsParam.split(",").map((i) => parseInt(i))
    : [];
  const results = await Promise.all(
    Object.keys(subjectQuestions).map((subject) =>
      fetchQuestions(subject, subjectQuestions)
    )
  );
  for (const result of results) {
    res.push(...result);
  }

  return NextResponse.json({ questions: res, cursors });
}
