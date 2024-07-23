import { NextResponse } from "next/server";

import client from "@/../../prisma/db";
import { APIResponse } from "@/types/APIResponses";

export async function GET(): Promise<NextResponse<APIResponse<any>>> {
  return NextResponse.json(
    { status: "error", message: "Non utilizzabile in production!" },
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

  return NextResponse.json(
    { status: "ok", data: questionsWithoutExplanations },
    { status: 200 }
  );
}
