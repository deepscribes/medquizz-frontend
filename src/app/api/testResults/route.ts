import { NextRequest, NextResponse } from "next/server";
import client from "@/../prisma/db";
import { APIResponse } from "@/types/APIResponses";
import type { Decimal } from "@prisma/client/runtime/library";

type TestResult = {
  score: Decimal;
  maxScore: Decimal;
};

export type TestResultsAPIResponse = TestResult[];

export async function GET(
  req: NextRequest
): Promise<NextResponse<APIResponse<TestResultsAPIResponse>>> {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (!type) {
    console.error("Missing test type");
    return NextResponse.json(
      { status: "error", message: "Il tipo di test non e' stato ricevuto." },
      { status: 400 }
    );
  }

  const res = await client.test.findMany({
    where: {
      type: type,
    },
    select: {
      score: true,
      maxScore: true,
    },
  });

  return NextResponse.json({ status: "ok", data: res });
}
