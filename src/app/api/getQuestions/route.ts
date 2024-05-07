import { Answer, Question } from "@prisma/client";
import client from "@/../prisma/db";
import { NextRequest, NextResponse } from "next/server";

type QuestionWithAnswers = Question & { answers: Answer[] };

export async function GET(req: NextRequest) {
  // Get cursors from query params
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  const cursorsParam = queryParams.get("cursors");

  // Key-value pair of subjects and the number of questions to fetch for each, for example, 15 questions for chemistry, ...
  const subjectQuestions = {
    "competenze di lettura e conoscenze acquisite negli studi": 4,
    "ragionamento logico e problemi": 5,
    biologia: 23,
    chimica: 15,
    "fisica e matematica": 13,
  } as const;
  type Subject = keyof typeof subjectQuestions;

  const res: QuestionWithAnswers[] = [];
  const cursors: number[] = cursorsParam
    ? cursorsParam.split(",").map((i) => parseInt(i))
    : [];
  let i = 0;
  for (const subject of Object.keys(subjectQuestions)) {
    let cursor;
    if (cursors[i] >= 0) {
      cursor = cursors[i]; // If cursor is already set, questions have already been fetched, so load those again
    } else {
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
    }
    // The questions are not chosen randomly, the cursor is, that way, given the same cursors, the questions will always be the same
    const questions = await client.question.findMany({
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
    res.push(...questions);
    i++;
  }

  return NextResponse.json({ questions: res, cursors });
}
