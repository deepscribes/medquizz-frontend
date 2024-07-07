import { NextResponse } from "next/server";

import client from "@/../../prisma/db";

export async function GET() {
  //   return NextResponse.json(
  //     { error: "Not allowed in production" },
  //     { status: 400 }
  //   );

  const questionsWithoutExplanations = await client.question.findMany({
    where: {
      explanation: {
        isNot: null,
      },
    },
    select: {
      id: true,
      answers: true,
    },
  });

  for (const question of questionsWithoutExplanations) {
  }
}
