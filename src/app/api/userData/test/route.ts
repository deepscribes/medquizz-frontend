import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { Subject, UserTestWithQuestionsAndAnswers } from "@/types";
import { createUserIfNotExists } from "@/lib/createUserIfNotExists";
import {
  createUserTest,
  getUserTests,
  getUserTestsById,
  getUserTestsBySubject,
} from "@/lib/userTests";
import { APIResponse } from "@/types/APIResponses";

export type UserDataTestGetAPIResponse = {
  tests:
    | UserTestWithQuestionsAndAnswers[]
    | UserTestWithQuestionsAndAnswers
    | null;
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<APIResponse<UserDataTestGetAPIResponse | null>>> {
  const { userId } = auth();

  const url = new URL(req.url);

  const subject = url.searchParams.get("subject");
  const id = url.searchParams.get("id");

  if (!userId) {
    console.error("Not logged in!");
    return NextResponse.json(
      { status: "error", message: "Non hai fatto l'accesso!" },
      { status: 401 }
    );
  }

  await createUserIfNotExists(userId);

  let res;

  if (subject) {
    // If subject is provided, return the tests made for that subject only
    res = await getUserTestsBySubject(subject, userId);
  } else if (id) {
    try {
      parseInt(id);
    } catch (err: unknown) {
      console.error("Invalid id, is not a number! Got:", id);
      return NextResponse.json(
        { status: "error", message: "Id invalido, non è un numero" },
        { status: 400 }
      );
    }
    // If id is provided, return the test with that id only
    res = await getUserTestsById(parseInt(id), userId);
  } else {
    // Otherwise, return all tests
    res = await getUserTests(userId);
  }

  return NextResponse.json({ status: "ok", data: { tests: res } });
}

export type UserDataTestPostBody = {
  type: Subject;
  score: number;
  maxScore: number;
  questionIds: number[];
  answerIds: number[];
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<APIResponse<void>>> {
  const { userId } = auth();
  if (!userId) {
    console.error("Not logged in!");
    return NextResponse.json(
      { status: "error", message: "Non hai fatto il login!" },
      { status: 401 }
    );
  }

  let { type, score, maxScore, questionIds, answerIds } =
    (await req.json()) as UserDataTestPostBody;

  if (!type || score == undefined || !maxScore) {
    console.error("Missing type or score or maxScore");
    return NextResponse.json(
      { status: "error", message: "Manca il tipo o il punteggio della prova" },
      { status: 400 }
    );
  }

  if (!questionIds || !answerIds) {
    console.error("Missing questionIds or answerIds");
    return NextResponse.json(
      { status: "error", message: "Missing questionIds or answerIds" },
      { status: 400 }
    );
  }

  try {
    await createUserTest(userId, type, score, maxScore, questionIds, answerIds);
  } catch (err: unknown) {
    let errorMessage = "C'è stato un errore sconosciuto";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error("An error occurred, ", errorMessage);
    return NextResponse.json(
      { status: "error", message: errorMessage },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
