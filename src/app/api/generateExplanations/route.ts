import { NextResponse } from "next/server";

import client from "@/../../prisma/db";

export async function GET() {
  return NextResponse.json(
    { error: "Not allowed in production" },
    { status: 400 }
  );

  const questionsWithoutExplanations = await client.question.findMany({
    where: {
      explanation: null,
    },
    select: {
      id: true,
      answers: true,
    },
  });

  let i = 0;

  let start = new Date().getTime();

  for (const question of questionsWithoutExplanations) {
    const res = await fetch(
      `http://localhost:3000/api/getExplanation?id=${question.id}`
    );
    console.log(
      `Fetched explanation for question ${i++}/${
        questionsWithoutExplanations.length
      }, estimated time left: ${(
        ((new Date().getTime() - start) / i) *
        questionsWithoutExplanations.length
      ).toFixed(2)}ms`
    );
  }

  return NextResponse.json(questionsWithoutExplanations, { status: 200 });
}
