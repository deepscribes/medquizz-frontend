import { NextRequest, NextResponse } from "next/server";
import client from "@/../prisma/db";
import { APIResponse } from "@/types/APIResponses";

type TestResult = {
  score: number;
  maxScore: number;
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

  const tests = await client.test.findMany({ where: { type } });
  const res: TestResult[] = tests.map((t: any) => ({
    score: t.score,
    maxScore: t.maxScore,
  }));

  return NextResponse.json({ status: "ok", data: res });
}
