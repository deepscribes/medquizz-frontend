import { NextRequest, NextResponse } from "next/server";
import { getClaudeResponse } from "@/lib/explanations";

import client, { docClient, TABLE_NAME } from "@/../prisma/db";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIResponse } from "@/types/APIResponses";

export type GetExplanationAPIResponse = {
  text: string;
  questionId: number;
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<APIResponse<GetExplanationAPIResponse>>> {
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  let questionId = queryParams.get("id");
  const subject = queryParams.get("subject");
  const number = queryParams.get("number");

  if (subject && number) {
    const res = await client.question.findMany({
      where: {
        subject,
        number: { gte: parseInt(number), lte: parseInt(number) },
      },
    });
    questionId = res[0]?.id?.toString() ?? null;
  }
  if (questionId == null) {
    console.log("Missing question ID query parameter");
    return NextResponse.json(
      {
        status: "error",
        message: "Manca il parametro ID della domanda",
      },
      {
        status: 400,
      }
    );
  }

  if (isNaN(parseInt(questionId))) {
    console.log("Invalid question ID (couldn't parse as number)");
    return NextResponse.json(
      {
        status: "error",
        message: "ID della domanda non valido (non è un numero)",
      },
      {
        status: 400,
      }
    );
  }

  const questionRes = await client.question.findMany({
    where: { id: parseInt(questionId) },
  });
  const question = questionRes[0];
  if (!question) {
    console.log("No question found for question ID " + questionId);
    return NextResponse.json(
      {
        status: "error",
        message: "Nessuna domanda trovata per l'ID " + questionId,
      },
      {
        status: 404,
      }
    );
  }

  if (question.explanation !== null) {
    console.log(
      "Explanation already exists for question ID " +
        questionId +
        ", returning it..."
    );
    return NextResponse.json(
      {
        status: "ok",
        data: {
          text: question.explanation.text,
          questionId: question.id,
        },
      },
      { status: 200 }
    );
  }

  console.log(
    "Question ID " + questionId + " has no explanation yet. Asking Claude..."
  );

  // Get the explanation from Claude
  const response = await getClaudeResponse(question, question.answers);
  if (response == null) {
    console.log(
      "Claude couldn't generate an explanation for question ID " + questionId
    );
    return NextResponse.json(
      {
        status: "error",
        message: "Claude non sa come rispondere. QuestionId: " + questionId,
      },
      {
        status: 500,
      }
    );
  }
  // Add the explanation to the database
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { pk: `QUESTION#${question.id}` },
      UpdateExpression: "SET explanation = :e",
      ExpressionAttributeValues: { ":e": { text: response } },
    })
  );

  console.log(
    "Explanation added to the database for question ID " + questionId
  );

  return NextResponse.json({
    status: "ok",
    data: {
      text: response,
      questionId: question.id,
    },
  });
}
