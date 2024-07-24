"use client";
import { Navbar } from "@/components/navbar";
import { Subject } from "@/types";
import React, { useCallback, useEffect, useState } from "react";

import { MathJax, MathJaxContext } from "better-react-mathjax";
import { QuestionWithAnswers } from "@/lib/questions";
import { useAuth } from "@clerk/nextjs";
import { Disclaimer } from "@/components/ui/disclaimer";
import { formatTextForTest } from "@/lib";
import { isUserAdmin } from "@/lib/isUserAdmin";

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
  const data: any = await res.json();
  if(data.status !== "ok") {
    return null;
  }
  if (data.data.questions.length === 0) return null;
  return data.data.questions[0];
}

async function getExplanation(
  subject: string,
  number: number,
  rightAnswer: string
) {
  const res = await fetch(
    `/api/getExplanation?subject=${subject}&number=${number}`
  );
  const data = await res.json();
  return data.status === "ok"
    ? data.data.text
        .replaceAll("\\\\", "\\")
        .replaceAll("\n", "<br>")
        .replaceAll("[FAVA]", rightAnswer)
    : null;
}

export default function Modifica() {
  const { userId } = useAuth();
  const [subject, setSubject] = useState<string>(Subject.Chimica);
  const [number, setNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [question, setQuestion] = useState<QuestionWithAnswers | null>(null);
  const [newExplanation, setNewExplanation] = useState("");

  const updateExplanation = useCallback(async () => {
    setIsLoading(true);
    if (!number) return;
    const question = await getQuestion(subject, number);

    if (!question) {
      setExplanation("La domanda non esiste, per favore controlla il numero");
      setIsLoading(false);
      return;
    }

    setQuestion(question);

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
  }, [subject, number]);

  useEffect(() => {
    if (!subject || !number) {
      setExplanation("Seleziona una materia e digita il numero della domanda.");
      return;
    }

    updateExplanation();
  }, [subject, number, userId, updateExplanation]);

  useEffect(() => {
    setNumber(1);
    sessionStorage.setItem("redirectUrl", "/commenti");
  }, []);

  if (!userId || !isUserAdmin(userId)) {
    return <h1>Non hai accesso a questa pagina</h1>;
  }
  return (
    <>
      <Navbar />
      <MathJaxContext>
        <main className="flex-grow mx-auto w-full lg:w-1/2 md:w-3/4 min-w-[300px] pb-16">
          <h1 className="text-3xl font-semibold my-12 text-text-cta text-center mx-auto">
            AGGIORNA QUESITI COMMENTATI{" "}
            <span className="font-extrabold">
              MI RACOMMANDO QUESTO VA IN PROD
            </span>
          </h1>
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
            <h1 className="text-red-600 mx-auto text-center mt-6 text-2xl">
              Quesito:
            </h1>
            <MathJax inline dynamic>
              <p
                className="p-3 sm:p-9"
                dangerouslySetInnerHTML={{
                  __html: formatTextForTest(question?.question || ""),
                }}
              ></p>
            </MathJax>
            <h1 className="text-red-600 mx-auto text-center mt-6 text-2xl">
              Spiegazione odierna:
            </h1>
            <MathJax inline dynamic>
              <p
                className="p-3 sm:p-9"
                dangerouslySetInnerHTML={{
                  __html: isLoading
                    ? "Caricamento in corso, attendere..."
                    : explanation ||
                      "Per favore, seleziona una materia e digita il numero della domanda.",
                }}
              ></p>
            </MathJax>
          </div>
          <div>
            <h1 className="text-red-600 mx-auto text-center mt-6 text-2xl">
              INSERICI QUI LA NUOVA SPIEGAZIONE
            </h1>
            <textarea
              name="newExplanation"
              id="newExplanation"
              className="w-full min-h-96 border border-cardborder rounded-lg p-4 mt-8"
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
            />
          </div>
          <div className="my-6">
            <h1 className="text-red-600 mx-auto text-center mt-6 text-2xl">
              PREVIEW DELLA NUOVA SPIEGAZIONE
            </h1>
            <div className="w-full min-h-96 border border-cardborder rounded-lg p-4 mt-8 bg-white">
              <MathJax inline dynamic>
                <p
                  className="p-3 sm:p-9"
                  dangerouslySetInnerHTML={{
                    __html: newExplanation
                      .replaceAll("\\\\", "\\")
                      .replaceAll("\n", "<br>"),
                  }}
                ></p>
              </MathJax>
            </div>
          </div>
        </main>
        <button
          className="w-full bg-red-600 text-white font-semibold py-4 rounded-lg mt-8"
          onClick={() => {
            if (confirm("MA PROPRIO SICURO SICURO SICURO???")) {
              fetch("/api/updateExplanations", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  questionId: question?.id,
                  explanation: newExplanation,
                }),
              }).then(() => {
                alert("Spiegazione modificata con successo");
                setExplanation(newExplanation);
              });
            }
          }}
        >
          SEI ASSOLUTAMENTE SICURO DI VOLER MODIFICARE LA SPIEGAZIONE?
        </button>
      </MathJaxContext>
      <Disclaimer />
    </>
  );
}
