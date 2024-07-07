import { NextRequest, NextResponse } from "next/server";
import { getClaudeResponse, isExplanationInDB } from "@/lib/explanations";

import client from "@/../prisma/db";

export async function GET(req: NextRequest) {
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  const questionId = queryParams.get("id");
  if (questionId == null) {
    return NextResponse.json("Missing question ID query parameter", {
      status: 400,
    });
  }

  if (isNaN(parseInt(questionId))) {
    return NextResponse.json("Invalid question ID (couldn't parse as number)", {
      status: 400,
    });
  }

  const question = await client.question.findUnique({
    where: { id: parseInt(questionId) },
    include: { answers: true, explanation: true },
  });
  if (!question) {
    return NextResponse.json(
      "No question found for question ID " + questionId,
      {
        status: 404,
      }
    );
  }

  if (question.explanation !== null) {
    return NextResponse.json(
      {
        text: question.explanation.text,
        questionId: question.id,
      },
      { status: 200 }
    );
  }

  // Get the explanation from Claude
  const response = await getClaudeResponse(question, question.answers);
  if (response == null) {
    return NextResponse.json(
      {
        error: "Claude non sa come rispondere. QuestionId: " + questionId,
      },
      {
        status: 500,
      }
    );
  }
  // Add the explanation to the database
  await client.explanation.create({
    data: {
      text: response,
      questionId: question.id,
    },
  });

  return NextResponse.json({ text: response, questionId: question.id });
}
