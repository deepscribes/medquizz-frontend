import { NextRequest, NextResponse } from "next/server";

import client from "@/../prisma/db";

export async function POST(req: NextRequest) {
  const { questionId } = await req.json();
  if (!questionId) {
    return NextResponse.json({ error: "Invalid questionId" }, { status: 400 });
  }
  await client.report.create({
    data: {
      questionId,
    },
  });
  return NextResponse.json({ success: true }, { status: 200 });
}
