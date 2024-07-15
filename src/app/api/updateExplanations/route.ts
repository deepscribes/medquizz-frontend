import { NextRequest, NextResponse } from "next/server";

import client from "@/../prisma/db";

export async function PUT(req: NextRequest) {
  const { questionId, explanation } = await req.json();

  console.log(questionId, explanation);

  if (!questionId || !explanation) {
    return NextResponse.json(
      { message: "Missing questionId or explanation" },
      { status: 400 }
    );
  }

  try {
    parseInt(questionId);
  } catch (e) {
    return NextResponse.json(
      { message: "questionId must be a number!" },
      { status: 400 }
    );
  }

  if (explanation.length < 20) {
    return NextResponse.json(
      { message: "Explanation must be at least 20 characters long" },
      { status: 400 }
    );
  }

  await client.explanation.update({
    where: {
      questionId,
    },
    data: {
      text: explanation,
    },
  });

  return NextResponse.json({ message: "PUT request received" });
}
