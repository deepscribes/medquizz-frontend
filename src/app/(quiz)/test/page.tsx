"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/Question";
import { Timer } from "@/components/timer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MathJaxContext } from "better-react-mathjax";
import { useSearchParams } from "next/navigation";
import type { QuestionWithAnswers } from "@/lib/questions";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ReviewType, useReview } from "@/hooks/useReview";
import { GetQuestionsAPIResponse } from "@/app/api/getQuestions/route";
import { APIResponse } from "@/types/APIResponses";
import { Modal } from "@/components/Modal";
import { Plan } from "@prisma/client";

export default function Test() {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { review, setReview } = useReview();

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
    const randomize = searchParams.get("randomize");

    sessionStorage.setItem(
      "redirectUrl",
      `/test?subject=${subject}&startTime=${startTime}&excludePastQuestions=${excludePastQuestions}&startTime=${startTime}&questionCount=${count}&from=${from}&to=${to}&randomize=${randomize}`
    );

    if (startTime == 0) {
      alert(
        "Orario di inizio test non valido, riportando alla pagina iniziale"
      );
      router.push("/seleziona");
      return;
    }

    if (!subject) {
      alert("Materia non valida, riportando alla pagina iniziale");
      router.push("/seleziona");
      return;
    }

    if (questions && questions.length > 2) {
      console.log("Using cached questions");
      try {
        setQuestions(JSON.parse(questions));
      } catch (err) {
        localStorage.clear();
        window.location.reload();
      }
      return;
    }

    fetch(
      `/api/getQuestions?subject=${subject}&excludePastQuestions=${excludePastQuestions}${
        // If from and to are both set, use them, otherwise use count
        from == null || to == null || (from == "0" && to == "0")
          ? `&count=${count}`
          : `&from=${from || 0}&to=${to || 1}`
      }&randomize=${randomize}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((response: APIResponse<GetQuestionsAPIResponse>) => {
        if (
          !response ||
          response.status == "error" ||
          !response.data.questions?.length
        ) {
          alert(
            "Non ci sono domande disponibili con questi filtri. Sarai riportato alla pagina di scelta."
          );
          router.push("/seleziona");
        } else {
          setQuestions(response.data.questions);
          localStorage.setItem(
            "questions",
            JSON.stringify(response.data.questions)
          );
        }
      })
      .catch((err) => {
        console.error(err);
        alert(
          "Errore nel caricamento delle domande. Sarai riportato alla pagina di scelta."
        );
        router.push("/seleziona");
      });
  }, [router, searchParams]);

  return (
    <>
      <MathJaxContext>
        <Navbar isTesting={true} />
        <main>
          {showModal && (
            <Modal>
              <div className="text-center">
                <h1 className="text-xl font-bold">
                  Questa azione è riservata ad utenti con piani {Plan.PRO} o{" "}
                  {Plan.EXCLUSIVE}
                </h1>
                <p className="py-2">
                  Se hai già un piano, effettua il login per continuare con il
                  test.
                </p>
                <div className="flex justify-center gap-x-4 my-4">
                  <button
                    className="px-4 py-2 text-primary rounded-md"
                    onClick={() => {
                      setShowModal(false);
                    }}
                  >
                    Indietro
                  </button>
                  <a
                    href="/#pricing"
                    id="sign-up-button-modal-comments"
                    className="px-4 py-2 bg-primary text-white rounded-md"
                  >
                    Guarda i nostri piani
                  </a>
                </div>
              </div>
            </Modal>
          )}
          <div className="text-center my-6 max-w-4xl mx-auto px-8">
            {review !== ReviewType.AfterTest && (
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
