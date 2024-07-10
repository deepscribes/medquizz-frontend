"use client";
import { Navbar } from "@/components/navbar";
import { Subject } from "@/types";
import { useEffect, useState } from "react";

import { MathJax, MathJaxContext } from "better-react-mathjax";
import { QuestionWithAnswers } from "@/lib/questions";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

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

export default function Commenti() {
  const { userId } = useAuth();
  const [subject, setSubject] = useState<string>(Subject.Chimica);
  const [number, setNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  function updateExplanation() {
    setIsLoading(true);
    fetch(`/api/getQuestions?subject=${subject}&from=${number}&to=${number}`)
      .then((res) => res.json())
      .then((data: { questions: QuestionWithAnswers[] }) => {
        let rightAnswer;
        if (data.questions.length === 0) {
          rightAnswer = "La domanda non esiste, per favore controlla il numero";
          return;
        }
        rightAnswer =
          data.questions[0].answers.find((a) => a.isCorrect)?.text || null;

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
                .replaceAll("[FAVA]", rightAnswer)
            );
            setIsLoading(false);
          });
      });
  }

  useEffect(() => {
    if (!subject || !number) {
      setExplanation("Seleziona una materia e digita il numero della domanda.");
      return;
    }
    updateExplanation();
    if (!userId && !(subject == Subject.Chimica && number == 1)) {
      setShowModal(true);
    }
  }, [subject, number]);

  useEffect(() => {
    setNumber(1);
  }, []);
  return (
    <>
      <Navbar />
      <MathJaxContext>
        <main className="flex-grow mx-auto w-full lg:w-1/2 md:w-3/4 min-w-[300px] pb-16">
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-8 rounded-xl border border-cardborder">
                <h1 className="text-3xl font-semibold text-text-cta text-center">
                  🚨 Attenzione
                </h1>
                <p className="text-lg my-6 text-text-cta text-center">
                  Per visualizzare le spiegazioni è necessario essere
                  autenticati
                </p>
                <div className="flex justify-center gap-x-4">
                  <button
                    className="px-4 py-2 text-primary rounded-md"
                    onClick={() => {
                      setShowModal(false);
                      setExplanation("");
                      setNumber(1);
                      setSubject(Subject.Chimica);
                      updateExplanation();
                    }}
                  >
                    Indietro
                  </button>
                  <button
                    className="px-4 py-2 bg-primary text-white rounded-md"
                    onClick={() => {
                      router.push("/login");
                    }}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          )}
          <h1 className="text-3xl font-semibold mt-12 text-text-cta text-center mx-auto">
            🪄 Quesiti Commentati - Banca Dati Luglio 2024
          </h1>
          <p className="text-lg my-6 text-text-cta text-center w-3/4 mx-auto">
            Seleziona la materia e digita il numero della domanda di cui cerchi
            la soluzione, et voilà!
          </p>
          <div className="border border-cardborder w-full bg-white py-8 pt-0 rounded-2xl">
            <div className="flex flex-row flex-nowrap py-4 text-lg sm:text-xl gap-x-4 border-b border-cardborder px-2 sm:px-8 font-semibold">
              <select
                className="flex-1 indent-0"
                onChange={(e) => {
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
                  setNumber(parseInt(e.target.value));
                }}
              />
            </div>
            <MathJax>
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
        </main>
      </MathJaxContext>
    </>
  );
}
