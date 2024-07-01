import { NextRequest, NextResponse } from "next/server";
import { Subject } from "@/types";
import {
  SubjectQuestions,
  QuestionWithAnswers,
  subjectQuestions,
  fetchRandomQuestionsFromSubject,
  fetchOrderedQuestionsFromSubject,
  getWrongQuestionsFromUser,
} from "@/lib/questions";
import { auth } from "@clerk/nextjs/server";
import client from "@/../prisma/db";

function isSubject(subject: string): subject is Subject {
  return Object.values(Subject).includes(subject as Subject);
}

function SubjectTypeToSubjectDatabase(
  subject: Subject
): keyof SubjectQuestions {
  if (subject === Subject.Completo || subject === Subject.Rapido) {
    throw new Error("Invalid subject");
  }
  switch (subject) {
    case Subject.Fisica:
      return "fisica e matematica";
    case Subject.Biologia:
      return "biologia";
    case Subject.Chimica:
      return "chimica";
    case Subject.Lettura:
      return "competenze di lettura e conoscenze acquisite negli studi";
    case Subject.Logica:
      return "ragionamento logico e problemi";
    default:
      throw new Error("Invalid subject");
  }
}

export async function GET(req: NextRequest) {
  // Get cursors from query params
  const { userId } = auth();
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  const subject = queryParams.get("subject");
  const count = queryParams.get("count");
  const from = queryParams.get("from");
  const to = queryParams.get("to");
  const excludePastQuestions = queryParams.get("excludePastQuestions");

  if (subject == null || !isSubject(subject)) {
    return NextResponse.json(
      "Missing subject query parameter, received " + subject,
      {
        status: 400,
      }
    );
  }

  const res: QuestionWithAnswers[] = [];

  try {
    if (subject === Subject.Ripasso) {
      if (!userId) return NextResponse.json("Missing user id", { status: 400 });
      const questions = await getWrongQuestionsFromUser(userId);
      res.push(...questions);
      return NextResponse.json({ questions: res });
    }
    if (subject == Subject.Completo || subject === Subject.Rapido) {
      const results = await Promise.all(
        Object.keys(subjectQuestions).map((s) => {
          const questionCount =
            subjectQuestions[s as keyof SubjectQuestions][subject] || 15;
          return fetchRandomQuestionsFromSubject(
            s as keyof SubjectQuestions,
            questionCount,
            excludePastQuestions ? userId : null
          );
        })
      );
      for (const result of results) {
        res.push(...result);
      }
    } else {
      if (count == null && from == null && to == null) {
        return NextResponse.json(
          "Count, from and to are all null, got " +
            count +
            " " +
            from +
            " " +
            to,
          {
            status: 400,
          }
        );
      }

      if (count !== null) {
        const questionCount = parseInt(count);
        const questions = await fetchRandomQuestionsFromSubject(
          SubjectTypeToSubjectDatabase(subject),
          questionCount,
          excludePastQuestions ? userId : null
        );
        res.push(...questions);
      } else {
        if (from == null || to == null) {
          return NextResponse.json(
            "From and to are both null, got " + from + " " + to,
            {
              status: 400,
            }
          );
        }

        const fromInt = parseInt(from);
        const toInt = parseInt(to);
        if (fromInt > toInt) {
          return NextResponse.json(
            "From is greater than to, got " + from + " " + to,
            {
              status: 400,
            }
          );
        }

        const questions = await fetchOrderedQuestionsFromSubject(
          SubjectTypeToSubjectDatabase(subject),
          fromInt,
          toInt,
          excludePastQuestions ? userId : null
        );
        res.push(...questions);
      }
    }

    return NextResponse.json({ questions: res });
  } catch (err) {
    return NextResponse.json(err, {
      status: 500,
    });
  }
}
