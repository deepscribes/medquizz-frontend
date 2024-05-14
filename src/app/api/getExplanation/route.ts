import { NextRequest, NextResponse } from "next/server";
import { getOpenAIResponse, isExplanationInDB } from "@/lib/explanations";

import client from "@/../prisma/db";

export async function GET(req: NextRequest) {
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  // Question ID should be the question's jsonID, NOT the question's ID in the database
  const questionId = queryParams.get("id");
  if (questionId == null) {
    return NextResponse.json("Missing question ID query parameter", {
      status: 400,
    });
  }

  if (await isExplanationInDB(parseInt(questionId))) {
    return NextResponse.json(
      await client.explanation.findUniqueOrThrow({
        where: { id: parseInt(questionId) },
      })
    );
  } else {
    // Get the explanation from OpenAI
    const question = await client.question.findUniqueOrThrow({
      where: { jsonid: parseInt(questionId) },
      include: { answers: true },
    });
    const response = await getOpenAIResponse(question, question.answers);
    if (response == null) {
      return NextResponse.json(
        "No explanation found for question ID " + questionId,
        {
          status: 404,
        }
      );
    }
    // Add the explanation to the database
    await client.explanation.create({
      data: {
        text: response,
        questionId: question.jsonid,
      },
    });
  }

  return NextResponse.json(
    await client.explanation.findUniqueOrThrow({
      where: { id: parseInt(questionId) },
    })
  );
}
