import client from "@/../prisma/db";
import { APIResponse } from "@/types/APIResponses";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export type GetCorrectAnswersAPIResponse = {
  correctAnswers: number[];
};

export async function GET(
  _req: NextRequest
): Promise<NextResponse<APIResponse<GetCorrectAnswersAPIResponse>>> {
  const questions = await client.question.findMany();
  const correctAnswers: number[] = [];
  for (const q of questions) {
    (q.answers || [])
      .filter((a: any) => a.isCorrect)
      .forEach((a: any) => correctAnswers.push(a.id));
  }
  return NextResponse.json({
    status: "ok",
    data: { correctAnswers },
  });
}
