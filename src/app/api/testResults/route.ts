import { NextRequest, NextResponse } from "next/server";
import client from "@/../prisma/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (!type) {
    return NextResponse.json({ error: "Missing test type" }, { status: 400 });
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

  return NextResponse.json(res);
}
