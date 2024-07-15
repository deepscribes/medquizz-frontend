"use client";

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { Question, Test } from "@prisma/client";
import { useAuth } from "@clerk/nextjs";

type TestWithQuestions = Test & {
  correctQuestions: Question[];
  wrongQuestions: Question[];
  notAnsweredQuestions: Question[];
};

const defaultTableDataClass =
  "border border-cardborder py-2 sm:py-4 px-4 border-r-transparent border-b-transparent";

export default function Profile() {
  const { userId } = useAuth();
  const [subject, setSubject] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TestWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId || !subject) return;
    (async () => {
      setIsLoading(true);
      const res = await fetch(`/api/userData/test?subject=${subject}`);
      const data = await res.json();
      setTrendData(data);
      setIsLoading(false);
    })();
  }, [subject, userId]);

  useEffect(() => {
    sessionStorage.setItem("redirectUrl", "/profilo");
    setSubject("completo");
  }, []);

  if (!userId) return <div>Non sei loggato</div>;
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="rounded-lg px-4 sm:px-12 md:px-24 py-4 sm:py-6 md:py-10 min-h-[60vh]">
          <label htmlFor="selectSubject" className="text-text-extralight">
            Materia
          </label>
          <select
            id="selectSubject"
            value={subject || ""}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-max py-3 -ml-1 rounded-lg text-lg md:text-xl font-semibold bg-transparent text-text-cta"
          >
            <option className="text-black" value="completo">
              Simulazione ufficiale
            </option>
            <option className="text-black" value="rapido">
              Simulazione rapida
            </option>
            <option className="text-black" value="fisica">
              Fisica e matematica
            </option>
            <option className="text-black" value="biologia">
              Biologia
            </option>
            <option className="text-black" value="chimica">
              Chimica
            </option>
            <option className="text-black" value="lettura">
              Competenze di lettura
            </option>
            <option className="text-black" value="logica">
              Logica
            </option>
          </select>
          <div className="w-full max-w-full overflow-x-auto">
            {isLoading ? (
              <h1 className="w-full text-center text-2xl my-12 font-semibold text-text-cta">
                Caricamento in corso, per favore attendi...
              </h1>
            ) : trendData.length == 0 ? (
              <h1 className="w-full text-center text-2xl my-12 font-semibold text-text-lightblue">
                Non ci sono dati disponibili per questa materia
              </h1>
            ) : (
              <table
                className="w-full border-separate rounded-2xl mt-8 text-base"
                border={0}
                cellSpacing={0}
                cellPadding={0}
              >
                <thead>
                  <tr>
                    <th className="px-2 text-nowrap">🟢 Corrette</th>
                    <th className="px-2 text-nowrap">🔴 Errate</th>
                    <th className="px-2 text-nowrap">🟡 Omesse</th>
                    <th className="px-2 text-nowrap">⌚ Data/ora</th>
                    <th className="px-2 text-nowrap"></th>
                  </tr>
                </thead>
                <tbody className="rounded-2xl before:leading-[6px] before:content-['-'] before:text-transparent before:bg-transparent">
                  {trendData.map((test, i) => (
                    <tr key={test.id} className={`text-center bg-white`}>
                      <td
                        className={`${defaultTableDataClass} ${
                          i == 0 ? "rounded-tl-2xl" : ""
                        } ${
                          i == trendData.length - 1
                            ? "rounded-bl-2xl !border-b-cardborder"
                            : ""
                        }`}
                      >
                        {test.correctQuestions.length}
                      </td>
                      <td
                        className={`${defaultTableDataClass} ${
                          i == trendData.length - 1
                            ? "!border-b-cardborder"
                            : ""
                        }`}
                      >
                        {test.wrongQuestions.length}
                      </td>
                      <td
                        className={`${defaultTableDataClass} ${
                          i == trendData.length - 1
                            ? "!border-b-cardborder"
                            : ""
                        }`}
                      >
                        {test.notAnsweredQuestions.length}
                      </td>
                      <td
                        className={`${defaultTableDataClass} text-sm ${
                          i == trendData.length - 1
                            ? "!border-b-cardborder"
                            : ""
                        }`}
                      >
                        <div className="flex flex-row flex-wrap gap-x-2 justify-center">
                          <span className="text-nowrap">
                            {new Date(test.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-nowrap">
                            {new Date(test.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`${defaultTableDataClass} !border-r-cardborder ${
                          i == 0 ? "rounded-tr-2xl" : ""
                        } ${
                          i == trendData.length - 1
                            ? "rounded-br-2xl !border-b-cardborder"
                            : ""
                        }`}
                      >
                        <a
                          className="text-text-lightblue"
                          href={`/viewTest/${test.id}`}
                        >
                          Visualizza
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
