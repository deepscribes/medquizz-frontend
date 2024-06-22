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

  if (isNaN(parseInt(questionId))) {
    return NextResponse.json("Invalid question ID (couldn't parse as number)", {
      status: 400,
    });
  }

  if (await isExplanationInDB(parseInt(questionId))) {
    const question = await client.question.findUnique({
      where: { id: parseInt(questionId) },
      include: { explanation: true },
    });
    if (!question) {
      return NextResponse.json(
        "No question found for question ID " + questionId,
        {
          status: 404,
        }
      );
    }
    if (question.explanation.length) {
      return NextResponse.json(
        {
          text: question.explanation[0].text,
          questionId: question.id,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        "An unexpected error happened (explanation was supposed to be found but was not). QuestionId=" +
          questionId,
        {
          status: 500,
        }
      );
    }
  } else {
    // Get the explanation from OpenAI
    const question = await client.question.findUnique({
      where: { id: parseInt(questionId) },
      include: { answers: true },
    });
    if (!question) {
      return NextResponse.json(
        "No question found for question ID " + questionId,
        {
          status: 404,
        }
      );
    }
    const response = await getOpenAIResponse(question, question.answers);
    if (response == null) {
      return NextResponse.json(
        {
          text: "ChatGPT non sa come rispondere. QuestionId: " + questionId,
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
        questionId: question.jsonid,
      },
    });

    return NextResponse.json({ text: response, questionId: question.id });
  }
}
