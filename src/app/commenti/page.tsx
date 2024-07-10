"use client";
import { Navbar } from "@/components/navbar";
import { Subject } from "@/types";
import { useEffect, useState } from "react";

import { MathJax, MathJaxContext } from "better-react-mathjax";

const subjects = [
  Subject.Biologia,
  Subject.Chimica,
  Subject.Fisica,
  Subject.Logica,
  Subject.Lettura,
];

export default function Commenti() {
  const [subject, setSubject] = useState("anatomia");
  const [number, setNumber] = useState<number | null>(null);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!subject || !number) {
      setExplanation("Seleziona una materia e digita il numero della domanda.");
      return;
    }
    fetch(`/api/getExplanation?subject=${subject}&number=${number}`)
      .then((res) => res.json())
      .then((data) => {
        setExplanation(data.text);
      });
  }, [subject, number]);
  return (
    <>
      <Navbar />
      <MathJaxContext>
        <main className="flex-grow mx-auto w-1/2 min-w-[300px]">
          <h1 className="text-3xl font-semibold my-12 text-text-cta">
            🪄 Quesiti Commentati - Banca Dati Luglio 2024
          </h1>
          <p className="text-lg my-6 text-text-cta text-center w-3/4 mx-auto">
            Seleziona la materia e digita il numero della domanda di cui cerchi
            la soluzione, et voilà!
          </p>
          <div className="border border-cardborder w-full bg-white py-8 pt-0 rounded-2xl">
            <div className="flex flex-row flex-nowrap py-4 text-xl gap-x-4 border-b border-cardborder px-8 font-semibold">
              <select
                className="flex-1"
                onChange={(e) => {
                  setSubject(e.target.value);
                }}
              >
                {subjects.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="No."
                className="max-w-36"
                min={1}
                onChange={(e) => {
                  setNumber(parseInt(e.target.value));
                }}
              />
            </div>
            <MathJax>
              <p
                className="p-8"
                dangerouslySetInnerHTML={{
                  __html:
                    explanation ||
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
