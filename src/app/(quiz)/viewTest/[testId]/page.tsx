"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/Question";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MathJaxContext } from "better-react-mathjax";
import { useSearchParams } from "next/navigation";
import type { QuestionWithAnswers } from "@/lib/questions";
import type { Answer, Test } from "@prisma/client";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ReviewType, useReview } from "@/hooks/useReview";

type TestWithQuestions = Test & {
  correctQuestions: QuestionWithAnswers[];
  wrongQuestions: QuestionWithAnswers[];
  notAnsweredQuestions: QuestionWithAnswers[];
  answers: Answer[];
};

export default function ViewTest({ params }: { params: { testId: string } }) {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [testData, setTestData] = useState<TestWithQuestions | null>(null);
  const { setReview } = useReview();
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    setReview(ReviewType.AfterTest);
  }, []);

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
        .then((data: TestWithQuestions) => {
          if (!data.createdAt) {
            alert("Test non valido, riportando alla pagina iniziale");
            router.push("/seleziona");
            return;
          }
          const data = response.data;
          // Set answers in localStorage
          setTestData(data);
          const answeredQuestions = data.correctQuestions.concat(
            data.wrongQuestions
          );

          for (let i = 0; i < answeredQuestions.length; i++) {
            const question = answeredQuestions[i];
            const questionAnswersIds = question.answers.map((a) => a.id);
            const answer = data.answers.find((a) =>
              questionAnswersIds.includes(a.id)
            );

            if (!answer) {
              console.log("Answer not found for question", question);
              console.log("Answers", data.answers);
              continue;
            }
            localStorage.setItem(`question-${i}`, answer.id.toString());
          }

          const newQuestions = data.correctQuestions
            .concat(data.wrongQuestions)
            .concat(data.notAnsweredQuestions);
          setQuestions(newQuestions);
        });
    }
  }, [router, searchParams, params]);

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
              />
            ) : (
              <p>Caricamento...</p>
            )}
          </div>
        </main>
      </MathJaxContext>
      <Disclaimer />
    </>
  );
}
