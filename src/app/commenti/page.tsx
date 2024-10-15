"use client";
import { Navbar } from "@/components/navbar";
import { Subject } from "@/types";
import { Plan } from "@prisma/client";
import React, { useCallback, useEffect, useState } from "react";

import { MathJax, MathJaxContext } from "better-react-mathjax";
import { QuestionWithAnswers } from "@/lib/questions";
import { useAuth } from "@clerk/nextjs";
import { Disclaimer } from "@/components/ui/disclaimer";
import { Modal } from "@/components/Modal";
import { GetQuestionsAPIResponse } from "../api/getQuestions/route";
import { APIResponse } from "@/types/APIResponses";
import { GetExplanationAPIResponse } from "../api/getExplanation/route";
import { PremiumModal } from "@/components/Modal/exclusiveToPremium";
import { useUser } from "@/hooks/useUser";

const subjects = [
  Subject.Chimica,
  Subject.Biologia,
  Subject.Fisica,
  Subject.Logica,
  Subject.Lettura,
];

function formatSubject(subject: string) {
  switch (subject) {
    case Subject.Biologia:
      return "Biologia";
    case Subject.Chimica:
      return "Chimica";
    case Subject.Fisica:
      return "Fisica e Matematica";
    case Subject.Logica:
      return "Logica";
    case Subject.Lettura:
      return "Competenze di lettura";
  }
}

function formattedSubjectToSubject(formatted: string): string {
  switch (formatted) {
    case "Biologia":
      return Subject.Biologia;
    case "Chimica":
      return Subject.Chimica;
    case "Fisica e Matematica":
      return Subject.Fisica;
    case "Logica":
      return Subject.Logica;
    case "Competenze di lettura":
      return Subject.Lettura;
    default:
      return formatted;
  }
}

async function getQuestion(
  subject: string,
  number: number
): Promise<QuestionWithAnswers | null> {
  const res = await fetch(
    `/api/getQuestions?subject=${subject}&from=${number}&to=${number}`
  );
  const response: APIResponse<GetQuestionsAPIResponse> = await res.json();
  if (response.status === "error") return null;
  const data = response.data;
  if (data.questions.length === 0) return null;
  return data.questions[0];
}

async function getExplanation(
  subject: string,
  number: number,
  rightAnswer: string
) {
  const res = await fetch(
    `/api/getExplanation?subject=${subject}&number=${number}`
  );
  const response: APIResponse<GetExplanationAPIResponse> = await res.json();
  if (response.status === "error") return null;
  const data = response.data;
  return data.text
    ? data.text
        .replaceAll("\\\\", "\\")
        .replaceAll("\n", "<br>")
        .replaceAll("[FAVA]", rightAnswer)
    : null;
}

export default function Commenti() {
  const { userId } = useAuth();
  const user = useUser();
  const [subject, setSubject] = useState<string>(Subject.Chimica);
  const [number, setNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [questionId, setQuestionId] = useState<number | null>(null);

  const updateExplanation = useCallback(async () => {
    setIsLoading(true);
    if (!number) return;

    if(subject !== Subject.Chimica || number !== 1) {
       if ((!userId && !(subject == Subject.Chimica && number == 1)) || user?.plan !== Plan.EXCLUSIVE) {
         setShowModal(true);
         setExplanation(
	   "Per favore, effettua l'accesso per visualizzare le spiegazioni."
         );
	 setSubject(Subject.Chimica);
	 setNumber(1);
         setIsLoading(false);
         return;
      }
    }

    const question = await getQuestion(subject, number);

    if (!question) {
      setExplanation("La domanda non esiste, per favore controlla il numero");
      setIsLoading(false);
      return;
    }

    setQuestionId(question.id);

    const rightAnswer = question.answers.find((a) => a.isCorrect)?.text;

    if (!rightAnswer) {
      setExplanation(
        "Non ho trovato la risposta giusta per questa domanda, possibile che la domanda non esista?"
      );
      setIsLoading(false);
      return;
    }

    const explanationText = await getExplanation(
      subject,
      number,
      rightAnswer?.replaceAll("<p>", "").replaceAll("</p>", "")
    );

    if (!explanationText) {
      setExplanation(
        "Non ho trovato la spiegazione per questa domanda, possibile che la domanda non esista?"
      );
      setIsLoading(false);
      return;
    }

    setExplanation(explanationText);
    setIsLoading(false);
  }, [number, userId, subject]);

  useEffect(() => {
    if (!subject || !number) {
      setExplanation("Seleziona una materia e digita il numero della domanda.");
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    setTimer(setTimeout(updateExplanation, 2500));

    return () => {
      timer && clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, number, userId, updateExplanation]);

  useEffect(() => {
    if (showModal) {
      document.getElementById("sign-up-button-modal-comments")?.focus();
    }
  }, [showModal]);

  useEffect(() => {
    setNumber(1);
    sessionStorage.setItem("redirectUrl", "/commenti");
  }, []);
  return (
    <>
      <Navbar />
      <MathJaxContext>
        <main className="flex-grow mx-auto w-full lg:w-1/2 md:w-3/4 min-w-[300px] pb-16">
          {showModal && <PremiumModal setShowModal={setShowModal} />}
          <h1 className="text-3xl font-semibold mt-12 text-text-cta text-center mx-auto">
            🪄 Quesiti Commentati - Banca Dati Luglio 2024
          </h1>
          <p className="text-lg my-6 text-text-cta text-center w-3/4 mx-auto">
            Scegli la materia e inserisci il numero della domanda per la quale
            desideri la soluzione.
          </p>
          <div className="border border-cardborder w-full bg-white py-8 pt-0 rounded-2xl">
            <div className="flex flex-row flex-nowrap py-4 text-lg sm:text-xl gap-x-4 border-b border-cardborder px-2 sm:px-8 font-semibold">
              <select
                className="flex-1 indent-0"
                value={formatSubject(subject)}
                onChange={(e) => {
                  setIsLoading(true);
                  setSubject(formattedSubjectToSubject(e.target.value));
                }}
              >
                {subjects.map((subject) => (
                  <option key={subject}>{formatSubject(subject)}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="1"
                className="w-[100px] sm:w-full max-w-36 p-2 indent-0 border border-transparent border-b-cardborder"
                min={1}
                value={number || ""}
                onChange={(e) => {
                  setIsLoading(true);
                  setNumber(parseInt(e.target.value));
                }}
              />
            </div>
            <p className="p-3 sm:p-9 w-full">
              <MathJax
                inline
                dynamic
                dangerouslySetInnerHTML={{
                  __html: isLoading
                    ? "Caricamento in corso, attendere..."
                    : explanation ||
                      "Per favore, seleziona una materia e digita il numero della domanda.",
                }}
              ></MathJax>
            </p>

            <div className="w-full px-9 flex flex-row justify-between">
              <button
                className="text-text-gray text-sm"
                onClick={() => {
                  if (confirm("Vuoi segnalare questa domanda come errata?"))
                    fetch("/api/reportQuestion", {
                      method: "POST",
                      body: JSON.stringify({ questionId }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                }}
              >
                <span className="text-lg mr-1">⚑</span>
              </button>
              <small className="text-sm p-1 text-text-gray">
                Powered by Claude 3.5
              </small>
            </div>
          </div>
        </main>
      </MathJaxContext>
      <Disclaimer />
    </>
  );
}
