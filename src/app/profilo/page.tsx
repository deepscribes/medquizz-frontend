"use client";

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { Question, Test } from "@prisma/client";
import { useAuth } from "@clerk/nextjs";
import { Table } from "@/components/ui/table";

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
              <Table
                headers={[
                  "🟢 Corrette",
                  "🔴 Errate",
                  "🟡 Omesse",
                  "⌚ Data/ora",
                  "",
                ]}
                data={trendData.map((test, i) => [
                  test.correctQuestions.length,
                  test.wrongQuestions.length,
                  test.notAnsweredQuestions.length,
                  <div className="flex flex-row flex-wrap gap-x-2 justify-center">
                    <span className="text-nowrap">
                      {new Date(test.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-nowrap">
                      {new Date(test.createdAt).toLocaleTimeString()}
                    </span>
                  </div>,
                  <a
                    className="text-text-lightblue"
                    href={`/viewTest/${test.id}`}
                  >
                    Visualizza
                  </a>,
                ])}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
