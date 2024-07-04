import { NextRequest, NextResponse } from "next/server";

import { readFileSync } from "fs";

import client from "@/../prisma/db";
import { Question } from "@prisma/client";

type CustomQuestionFromDB = {
  id: number;
  argomento: string;
  nro: number;
  domanda: string;
  risposte: {
    id: string;
    text: string;
  }[];
};

export async function GET() {
  const data = readFileSync("banca_dati.json", "utf-8");
  const questions: CustomQuestionFromDB[] = JSON.parse(data).content;

  for (const question of questions) {
    console.log(`Creating question ${question.nro}...`);
    await client.question.create({
      data: {
        question: question.domanda,
        subject: question.argomento,
        number: question.nro,
        answers: {
          createMany: {
            data: question.risposte.map((answer) => {
              return {
                text: answer.text,
                isCorrect: answer.id === "a",
              };
            }),
          },
        },
      },
    });
  }
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const { questionId } = await req.json();
  if (!questionId) {
    return NextResponse.json({ error: "Invalid questionId" }, { status: 400 });
  }
  try {
    await client.report.create({
      data: {
        questionId,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
