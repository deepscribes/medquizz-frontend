"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/question";
import { Timer } from "@/components/timer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MathJaxContext } from "better-react-mathjax";
import { useSearchParams } from "next/navigation";
import type { QuestionWithAnswers } from "@/lib/questions";

export default function PageSuspense() {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isReview, setIsReview] = useState(false);

  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    const questions = localStorage.getItem("questions");
    const subject = searchParams.get("subject");
    const excludePastQuestions =
      searchParams.get("excludePastQuestions") || false;
    const startTime = parseInt(searchParams.get("startTime") || "0");
    const count = searchParams.get("questionCount");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (startTime == 0) {
      alert(
        "Orario di inizio test non valido, riportando alla pagina iniziale"
      );
      router.push("/seleziona");
    }

    if (!subject) {
      alert("Materia non valida, riportando alla pagina iniziale");
      router.push("/seleziona");
    }

    if (questions) {
      try {
        setQuestions(JSON.parse(questions));
      } catch (err) {
        localStorage.clear();
        window.location.reload();
      }
    } else {
      fetch(
        `/api/getQuestions?subject=${subject}&excludePastQuestions=${excludePastQuestions}${
          // If from and to are both set, use them, otherwise use count
          from == null || to == null || (from == "0" && to == "0")
            ? `&count=${count}`
            : `&from=${from || 0}&to=${to || 1}`
        }`
      )
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (!data || !data.questions?.length) {
            alert(
              "Non ci sono domande disponibili con questi filtri. Sarai riportato alla pagina di scelta."
            );
            router.push("/seleziona");
          }
          setQuestions(data.questions);
          localStorage.setItem("questions", JSON.stringify(data.questions));
        })
        .catch((err) => {
          console.error(err);
          alert(
            "Errore nel caricamento delle domande. Sarai riportato alla pagina di scelta."
          );
          router.push("/seleziona");
        });
    }

    const review = localStorage.getItem("isReview");
    if (review) {
      setIsReview(true);
    }
  }, [router, searchParams]);

  return (
    <>
      <MathJaxContext>
        <Navbar isTesting={true} />
        <main>
          <div className="text-center my-6 max-w-4xl mx-auto px-8">
            {!isReview && (
              <Timer
                startTime={parseInt(searchParams.get("startTime") || "0")}
                isReady={!!questions.length}
                questions={questions.length}
              />
            )}
            {questions.length ? ( // Only render the questions when they are loaded
              <QuestionRender
                setQuestionIndex={setQuestionIndex}
                questionIndex={questionIndex}
                question={questions[questionIndex]}
                count={questions.length}
                isReview={isReview}
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
