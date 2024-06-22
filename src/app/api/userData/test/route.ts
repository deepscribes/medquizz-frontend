import { NextRequest, NextResponse } from "next/server";

import client from "@/../prisma/db";
import { auth } from "@clerk/nextjs/server";
import { Subject } from "@/types";
import { createUserIfNotExists } from "@/lib/createUserIfNotExists";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return { status: 400, body: { error: "Missing userId" } };
  }

  let { type, score, maxScore } = (await req.json()) as {
    type: Subject;
    score: number;
    maxScore: number;
  };

  if (!type || !score || !maxScore) {
    return { status: 400, body: { error: "Missing type or score" } };
  }

  try {
    score = parseInt(score.toString());
    maxScore = parseInt(maxScore.toString());
  } catch (err) {
    return { status: 400, body: { error: "Invalid score or maxScore" } };
  }

  await createUserIfNotExists(userId);

  await client.test.create({
    data: {
      userId,
      type,
      score,
      maxScore,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
