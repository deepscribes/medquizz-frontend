import { Prisma, PrismaClient, Question } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const client = new PrismaClient();

  const subjectQuestions = {
    "competenze di lettura e conoscenze acquisite negli studi": 4,
    "ragionamento logico e problemi": 5,
    biologia: 23,
    chimica: 15,
    "fisica e matematica": 13,
  };
  const res: Question[] = [];
  for (const [subject, count] of Object.entries(subjectQuestions)) {
    const questions = await client.question.findMany({
      where: {
        subject,
      },
      take: count,
      orderBy: {
        number: "asc",
      },
      include: {
        answers: true,
      },
    });
    res.push(...questions);
  }

  return NextResponse.json(res);
}
