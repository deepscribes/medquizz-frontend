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
  cursors: number[],
  subject: string,
  subjectQuestions: Record<string, number>
) {
  let cursor;
  // Else, the cursor is set by choosing a random number between 0 and the total number of questions
  const totalQuestions = await client.question.count({
    where: {
      subject,
      answers: {
        some: {
          isCorrect: true,
        },
      },
    },
  });
  cursor = Math.floor(
    Math.random() *
      (totalQuestions -
        subjectQuestions[subject as keyof typeof subjectQuestions])
  );
  cursors.push(cursor);
  // The questions are not chosen randomly, the cursor is, that way, given the same cursors, the questions will always be the same
  return client.question.findMany({
    where: {
      AND: {
        subject,
        answers: {
          some: {
            isCorrect: true,
          },
        },
      },
    },
    take: subjectQuestions[subject as Subject],
    include: {
      answers: true,
    },
    skip: cursor,
  });
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
      fetchQuestions(cursors, subject, subjectQuestions)
    )
  );
  for (const result of results) {
    res.push(...result);
  }

  return NextResponse.json({ questions: res, cursors });
}
