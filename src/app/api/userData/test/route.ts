import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { Subject } from "@/types";
import { createUserIfNotExists } from "@/lib/createUserIfNotExists";
import {
  createUserTest,
  getUserTests,
  getUserTestsWithSubject,
} from "@/lib/userTests";

export async function GET(req: NextRequest) {
  const { userId } = auth();

  const url = new URL(req.url);

  const subject = url.searchParams.get("subject");

  if (!userId) {
    return NextResponse.json({ message: "Not logged in!" }, { status: 401 });
  }

  await createUserIfNotExists(userId);

  let res;

  if (subject) {
    // If subject is provided, return the tests made for that subject only
    res = await getUserTestsWithSubject(subject, userId);
  } else {
    // Otherwise, return all tests
    res = await getUserTests(userId);
  }

  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ message: "Not logged in!" }, { status: 401 });
  }

  let { type, score, maxScore, correctAnswers, wrongAnswers } =
    (await req.json()) as {
      type: Subject;
      score: number;
      maxScore: number;
      correctAnswers: number[];
      wrongAnswers: number[];
    };

  if (!type || score == undefined || !maxScore) {
    return NextResponse.json(
      { error: "Missing type or score or maxScore" },
      { status: 400 }
    );
  }

  if (!correctAnswers || !wrongAnswers) {
    return NextResponse.json(
      { error: "Missing correctAnswers or wrongAnswers" },
      { status: 400 }
    );
  }

  try {
    await createUserTest(
      userId,
      type,
      score,
      maxScore,
      correctAnswers,
      wrongAnswers
    );
  } catch (err: unknown) {
    let errorMessage = "An error occurred";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
