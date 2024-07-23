import client from "@/../prisma/db";
import { APIResponse } from "@/types/APIResponses";
import { NextResponse, NextRequest } from "next/server";

export type GetCorrectAnswersAPIResponse = {
  correctAnswers: number[];
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<APIResponse<GetCorrectAnswersAPIResponse>>> {
  const res = await client.answer.findMany({
    select: {
      id: true,
    },
    where: {
      isCorrect: true,
    },
  });

  return NextResponse.json({
    status: "ok",
    data: { correctAnswers: res.map((a) => a.id) },
  });
}
