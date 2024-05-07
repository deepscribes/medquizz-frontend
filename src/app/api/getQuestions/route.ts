import { Answer, Prisma, PrismaClient, Question } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const client = new PrismaClient();

  const subjectQuestions = {
    "competenze di lettura e conoscenze acquisite negli studi": 4,
    "ragionamento logico e problemi": 5,
    biologia: 23,
    chimica: 15,
    "fisica e matematica": 13,
  } as const;
  const res: (Question & { answers: Answer[] })[] = [];
  for (const subject of Object.keys(subjectQuestions)) {
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
      take: subjectQuestions[subject as keyof typeof subjectQuestions],
      include: {
        answers: true,
      },
      skip: Math.floor(
        Math.random() * totalQuestions -
          subjectQuestions[subject as keyof typeof subjectQuestions]
      ),
    });
    res.push(...questions);
  }

  return NextResponse.json(res);
}
