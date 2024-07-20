import { NextRequest, NextResponse } from "next/server";
import { getClaudeResponse } from "@/lib/explanations";

import client from "@/../prisma/db";
import { getUserPlan } from "@/lib/getUserPlan";
import { Plan } from "@prisma/client";

export async function GET(req: NextRequest) {
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  let questionId = queryParams.get("id");
  const subject = queryParams.get("subject");
  const number = queryParams.get("number");

  // Check if the user is allowed to get explanations
  // const role = await getUserPlan();
  // if (role !== Plan.EXCLUSIVE) {
  //   console.log("User is not allowed to get explanations");
  //   return NextResponse.json("User is not allowed to get explanations", {
  //     status: 403,
  //   });
  // }

  if (subject && number) {
    questionId =
      (await client.question
        .findFirst({
          where: {
            subject: subject,
            number: parseInt(number),
          },
          select: {
            id: true,
          },
        })
        .then((question) => question?.id.toString())) ?? null;
  }
  if (questionId == null) {
    console.log("Missing question ID query parameter");
    return NextResponse.json("Missing question ID query parameter", {
      status: 400,
    });
  }

  if (isNaN(parseInt(questionId))) {
    console.log("Invalid question ID (couldn't parse as number)");
    return NextResponse.json("Invalid question ID (couldn't parse as number)", {
      status: 400,
    });
  }

  const question = await client.question.findUnique({
    where: { id: parseInt(questionId) },
    include: { answers: true, explanation: true },
  });
  if (!question) {
    console.log("No question found for question ID " + questionId);
    return NextResponse.json(
      "No question found for question ID " + questionId,
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
        text: question.explanation.text,
        questionId: question.id,
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

  console.log(
    "Explanation added to the database for question ID " + questionId
  );

  return NextResponse.json({ text: response, questionId: question.id });
}
