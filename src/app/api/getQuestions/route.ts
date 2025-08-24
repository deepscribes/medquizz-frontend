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
import { getUserPlan } from "@/lib/getUserPlan";
import { Plan } from "@/types/db";
import { APIResponse } from "@/types/APIResponses";

function isSubject(subject: string): subject is Subject {
  return Object.values(Subject).includes(subject as Subject);
}

function SubjectTypeToSubjectDatabase(
  subject: Subject
): keyof SubjectQuestions {
  if (subject === Subject.Completo || subject === Subject.Rapido) {
    console.error("Invalid subject");
    throw new Error("Invalid subject");
  }
  switch (subject) {
    case Subject.Fisica:
      return "fisica";
    case Subject.Biologia:
      return "biologia";
    case Subject.Chimica:
      return "chimica";
    case Subject.Lettura:
      return "lettura";
    case Subject.Logica:
      return "logica";
    default:
      throw new Error("Invalid subject");
  }
}

export type GetQuestionsAPIResponse = {
  questions: QuestionWithAnswers[];
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<APIResponse<GetQuestionsAPIResponse>>> {
  // Get cursors from query params
  const { userId } = auth();
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  const subject = queryParams.get("subject");
  const count = queryParams.get("count");
  const from = queryParams.get("from");
  const to = queryParams.get("to");
  const excludePastQuestionsParam = queryParams.get("excludePastQuestions");
  const randomize = queryParams.get("randomize");
  const userPlan = await getUserPlan();

  let excludePastQuestions = true;
  if (
    excludePastQuestionsParam == "false" ||
    excludePastQuestionsParam == "0"
  ) {
    excludePastQuestions = false;
  }

  if (subject == null || !isSubject(subject)) {
    console.error("Missing subject query parameter, received " + subject);
    return NextResponse.json(
      {
        status: "error",
        message: "Missing subject query parameter, received " + subject,
      },
      {
        status: 400,
      }
    );
  }

  const res: QuestionWithAnswers[] = [];

  try {
    if (subject === Subject.Ripasso) {
      if (!userId) {
        console.error("Missing user id, can't get wrong questions");
        return NextResponse.json(
          {
            status: "error",
            message: "Non sembra tu abbia fatto l'accesso, per favore accedi",
          },
          { status: 400 }
        );
      }
      if (false && userPlan !== Plan.EXCLUSIVE) {
        return NextResponse.json(
          {
            status: "error",
            message:
              "L'utente non ha un piano abbastanza alto per ottenere domande sbagliate",
          },
          {
            status: 403,
          }
        );
      }
      const questions = await getWrongQuestionsFromUser(userId);
      res.push(...questions);
      return NextResponse.json({ status: "ok", data: { questions: res } });
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
      if (false && userPlan === Plan.BASIC) {
        console.log("User is not allowed to get questions");
        return NextResponse.json(
          {
            status: "error",
            message: "User does not have a high enough plan to get questions",
          },
          {
            status: 403,
          }
        );
      }
      if (count == null && from == null && to == null) {
        console.warn(
          "Count, from and to are all null, got " +
            count +
            " " +
            from +
            " " +
            to
        );
        return NextResponse.json(
          {
            status: "error",
            message:
              "I parametri `quantita'`, `da` e `a` sono tutti nulli, almeno uno deve essere specificato",
          },
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
          console.warn("From and to are null, got " + from + " " + to);
          return NextResponse.json(
            {
              status: "error",
              message: "I parametri `da` ed `a` sono nulli",
            },
            {
              status: 400,
            }
          );
        }

        const fromInt = parseInt(from);
        const toInt = parseInt(to);
        if (fromInt > toInt) {
          console.warn("From is greater than to");
          return NextResponse.json(
            {
              status: "error",
              message: "From is greater than to, got " + from + " " + to,
            },
            {
              status: 400,
            }
          );
        }

        let questions = await fetchOrderedQuestionsFromSubject(
          SubjectTypeToSubjectDatabase(subject),
          fromInt,
          toInt,
          excludePastQuestions ? userId : null
        );

        if (randomize == "true" || randomize == "1") {
          console.log("Randomizing order of questions");
          questions = questions.sort(() => Math.random() - 0.5);
        }

        res.push(...questions);
      }
    }

    return NextResponse.json({ status: "ok", data: { questions: res } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { status: "error", message: "Errore sconosciuto, per favore ritenta." },
      {
        status: 500,
      }
    );
  }
}
