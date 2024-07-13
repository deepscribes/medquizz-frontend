import { NextRequest, NextResponse } from "next/server";

import { readFileSync } from "fs";

import client from "@/../prisma/db";

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
  if (
    process.env.NODE_ENV === "production" ||
    process.env.DATABASE_URL?.endsWith("medquizz?schema=public")
  ) {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 400 }
    );
  }

  const data = await (
    await fetch(
      "https://domande-ap.mur.gov.it/api/v1/domanda/list?page=0&page-size=3500"
    )
  ).json();
  const updatedQuestions: CustomQuestionFromDB[] = data.content.filter(
    (q: CustomQuestionFromDB) =>
      q.argomento === "fisica-matematica" ||
      q.argomento === "chimica" ||
      q.argomento === "biologia"
  );

  const currentQuestions = await client.question.findMany({
    include: {
      answers: true,
    },
  });

  let i = 0;

  for (const question of updatedQuestions) {
    console.log(`Checking question ${++i}/${updatedQuestions.length}...`);
    if (
      question.argomento !== "fisica-matematica" &&
      question.argomento !== "chimica"
    ) {
      continue;
    }
    const dbQuestion = currentQuestions.find(
      (q) =>
        q.subject ===
          (question.argomento == "chimica" ? "chimica" : "fisica") &&
        q.number === question.nro
    );

    if (!dbQuestion) {
      throw new Error(
        `Question ${question.argomento} ${question.nro} not found in the database`
      );
    }

    if ([716, 74, 71, 386, 385, 965, 336].includes(question.nro)) {
      console.log("Updating question", dbQuestion.id, "...");
      console.log(dbQuestion.answers.map((a) => a.text));
      console.log("VS");
      console.log(question.risposte.map((r) => r.text));
      if (dbQuestion.question !== question.domanda)
        console.log("Question:", dbQuestion.question, "=>", question.domanda);
      else console.log("Updating answers...");
      await client.question.update({
        where: {
          id: dbQuestion.id,
        },
        data: {
          question: question.domanda,
          answers: {
            updateMany: question.risposte.map((answer, i) => ({
              where: {
                id: dbQuestion.answers[i].id,
              },
              data: {
                isCorrect: answer.id === "a",
                text: answer.text,
              },
            })),
          },
        },
      });
    }
  }
  return NextResponse.json(updatedQuestions);
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
