import { Answer, Question } from "@prisma/client";
import client from "@/../prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { Subject } from "@/types";
import { start } from "repl";

type QuestionWithAnswers = Question & { answers: Answer[] };

// Key-value pair of subjects and the number of questions to fetch for each, for example, 15 questions for chemistry, ...
const subjectQuestions = {
  "competenze di lettura e conoscenze acquisite negli studi": {
    completo: 4,
    rapido: 2,
  },
  "ragionamento logico e problemi": {
    completo: 5,
    rapido: 3,
  },
  biologia: {
    completo: 23,
    rapido: 11,
  },
  chimica: {
    completo: 15,
    rapido: 7,
  },
  "fisica e matematica": {
    completo: 13,
    rapido: 7,
  },
};

type SubjectQuestions = typeof subjectQuestions;

function isSubject(subject: string): subject is Subject {
  return Object.values(Subject).includes(subject as Subject);
}

function SubjectTypeToSubjectDatabase(
  subject: Subject
): keyof typeof subjectQuestions {
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
  }
}

async function fetchQuestions(
  subject: keyof SubjectQuestions,
  subjectQuestions: Partial<SubjectQuestions>,
  isReduced: boolean,
  start: number | null = null,
  count: number | null = null
) {
  const questions = client.$queryRaw<QuestionWithAnswers[]>`SELECT
    q.id,
    q.jsonid,
    q.question,
    q.subject,
    q.number,
    q."branoId",
    COALESCE(json_agg(json_build_object('id', a.id, 'text', a.text, 'isCorrect', a."isCorrect")) FILTER (WHERE a.id IS NOT NULL), '[]') AS answers
  FROM public."Question" q
  LEFT JOIN public."Answer" a ON q.jsonid = a."domandaId"
  WHERE q.subject = ${subject}
  GROUP BY q.id
  HAVING COUNT(*) > 0
  ORDER BY ${start ? "q.jsonid ASC" : "RANDOM()"}
  LIMIT ${
    count ?? isReduced
      ? subjectQuestions[subject]?.rapido || 30
      : subjectQuestions[subject]?.completo || 30
  }
  `;
  return questions;
}

export async function GET(req: NextRequest) {
  // Get cursors from query params
  const queryParams = new URLSearchParams(req.url.split("?")[1]);
  const subject = queryParams.get("subject") || "completo";
  const start = queryParams.get("start") || null;
  const count = queryParams.get("count") || null;
  if (subject == null || !isSubject(subject)) {
    return NextResponse.json(
      "Missing subject query parameter, received " + subject,
      {
        status: 400,
      }
    );
  }

  const res: QuestionWithAnswers[] = [];

  if (subject == Subject.Completo || subject === Subject.Rapido) {
    // Check that subject is valid
    const results = await Promise.all(
      Object.keys(subjectQuestions).map((s) =>
        fetchQuestions(
          s as keyof SubjectQuestions,
          subjectQuestions,
          subject == "rapido"
        )
      )
    );
    for (const result of results) {
      res.push(...result);
    }
  } else {
    if (count == null) {
      return NextResponse.json("Missing count query parameter", {
        status: 400,
      });
    }
    const result = await fetchQuestions(
      SubjectTypeToSubjectDatabase(subject),
      {
        [SubjectTypeToSubjectDatabase(subject)]: {
          completo: parseInt(count),
          rapido: parseInt(count),
        },
      },
      false,
      start == null ? null : parseInt(start)
    );
    res.push(...result);
  }

  return NextResponse.json({ questions: res });
}
