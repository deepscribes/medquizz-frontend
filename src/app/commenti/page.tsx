"use client";
import { Navbar } from "@/components/navbar";
import { Subject } from "@/types";
import { useEffect, useState } from "react";

import { MathJax, MathJaxContext } from "better-react-mathjax";
import { QuestionWithAnswers } from "@/lib/questions";

const subjects = [
  Subject.Biologia,
  Subject.Chimica,
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
      return "Matematica e Fisica";
    case Subject.Logica:
      return "Logica";
    case Subject.Lettura:
      return "Lettura";
  }
}

export default function Commenti() {
  const [subject, setSubject] = useState<string>(Subject.Chimica);
  const [number, setNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [rightAnswer, setRightAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (explanation && rightAnswer) {
      setExplanation((explanation) =>
        explanation.replaceAll(
          "[PLACEHOLDER]",
          `"${rightAnswer.replaceAll("<p>", "").replaceAll("</p>", "")}"` ||
            "[Non trovo la risposta giusta]"
        )
      );
      setIsLoading(false);
    }
  }, [rightAnswer]);

  useEffect(() => {
    if (!subject || !number) {
      setExplanation("Seleziona una materia e digita il numero della domanda.");
      return;
    }
    setIsLoading(true);
    fetch(`/api/getQuestions?subject=${subject}&from=${number}&to=${number}`)
      .then((res) => res.json())
      .then((data: { questions: QuestionWithAnswers[] }) => {
        if (data.questions.length === 0) {
          setRightAnswer(
            "La domanda non esiste, per favore controlla il numero"
          );
          return;
        }
        setRightAnswer(
          data.questions[0].answers.find((a) => a.isCorrect)?.text || null
        );
      });
    fetch(`/api/getExplanation?subject=${subject}&number=${number}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.text) {
          setExplanation(
            "Non ho trovato la spiegazione per questa domanda, possibile che la domanda non esista?"
          );
          return;
        }
        setExplanation(
          data.text
            .replaceAll("\\\\", "\\")
            .replaceAll("\n", "<br>")
            .replaceAll("[FAVA]", "[PLACEHOLDER]")
        );
      });
  }, [subject, number]);

  useEffect(() => {
    if (!explanation) {
      return;
    }
    // @ts-ignore
    global.MathJax && global.MathJax.typeset();
  }, [explanation]);
  return (
    <>
      <Navbar />
      <MathJaxContext>
        <main className="flex-grow mx-auto w-1/2 min-w-[300px] pb-16">
          <h1 className="text-3xl font-semibold my-12 text-text-cta text-center mx-auto">
            🪄 Quesiti Commentati - Banca Dati Luglio 2024
          </h1>
          <p className="text-lg my-6 text-text-cta text-center w-3/4 mx-auto">
            Seleziona la materia e digita il numero della domanda di cui cerchi
            la soluzione, et voilà!
          </p>
          <div className="border border-cardborder w-full bg-white py-8 pt-0 rounded-2xl">
            <div className="flex flex-row flex-nowrap py-4 text-xl gap-x-4 border-b border-cardborder px-8 font-semibold">
              <select
                className="flex-1 indent-0"
                onChange={(e) => {
                  setSubject(e.target.value);
                }}
              >
                {subjects.map((subject) => (
                  <option key={subject}>{formatSubject(subject)}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="No."
                className="max-w-36 p-2 indent-0 border border-transparent border-b-cardborder"
                min={1}
                onChange={(e) => {
                  setNumber(parseInt(e.target.value));
                }}
              />
            </div>
            <MathJax>
              <p
                className="p-9"
                dangerouslySetInnerHTML={{
                  __html: isLoading
                    ? "Caricamento in corso, attendere..."
                    : explanation ||
                      "Per favore, seleziona una materia e digita il numero della domanda.",
                }}
              ></p>
            </MathJax>
          </div>
        </main>
      </MathJaxContext>
    </>
  );
}
