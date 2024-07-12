"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/Question";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MathJaxContext } from "better-react-mathjax";
import { useSearchParams } from "next/navigation";
import type { QuestionWithAnswers } from "@/lib/questions";
import type { Test } from "@prisma/client";

type TestWithQuestions = Test & {
  correctQuestions: QuestionWithAnswers[];
  wrongQuestions: QuestionWithAnswers[];
  notAnsweredQuestions: QuestionWithAnswers[];
};

export default function ViewTest({ params }: { params: { testId: string } }) {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [testData, setTestData] = useState<TestWithQuestions | null>(null);

  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    sessionStorage.setItem("redirectUrl", `/test/${params.testId}`);

    if (!params.testId) {
      console.log(params);
      alert("Test non valido, riportando alla pagina iniziale");
      router.push("/seleziona");
      return;
    }

    if (testData) {
      setQuestions(
        testData.correctQuestions
          .concat(testData.wrongQuestions)
          .concat(testData.notAnsweredQuestions)
      );
    } else {
      fetch(`/api/userData/test?id=${params.testId}`)
        .then((res) => res.json())
        .then((data: TestWithQuestions[]) => {
          if (!data.length) {
            alert("Test non valido, riportando alla pagina iniziale");
            router.push("/seleziona");
            return;
          }
          setTestData(data[0]);
          setQuestions(
            data[0].correctQuestions
              .concat(data[0].wrongQuestions)
              .concat(data[0].notAnsweredQuestions)
          );
        });
    }
  }, [router, searchParams]);

  return (
    <>
      <MathJaxContext>
        <Navbar isTesting={true} />
        <main>
          <div className="text-center my-6 max-w-4xl mx-auto px-8">
            {questions && questions.length ? ( // Only render the questions when they are loaded
              <QuestionRender
                setQuestionIndex={setQuestionIndex}
                questionIndex={questionIndex}
                question={questions[questionIndex]}
                count={questions.length}
                isReview={true}
              />
            ) : (
              <p>Caricamento...</p>
            )}
          </div>
        </main>
      </MathJaxContext>
    </>
  );
}
