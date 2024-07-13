"use client";

import { useUser } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { Question, Test } from "@prisma/client";

type TestWithQuestions = Test & {
  correctQuestions: Question[];
  wrongQuestions: Question[];
  notAnsweredQuestions: Question[];
};

const defaultTableDataClass =
  "border border-cardborder p-4 border-r-transparent border-b-transparent";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [subject, setSubject] = useState("completo");
  const [trendData, setTrendData] = useState<TestWithQuestions[]>([]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const res = await fetch(`/api/userData/test?subject=${subject}`);
      const data = await res.json();
      setTrendData(data);
    })();
  }, [subject, isLoaded, isSignedIn]);

  useEffect(() => {
    sessionStorage.setItem("redirectUrl", "/profilo");
  }, []);

  if (!isLoaded) return null;
  if (!isSignedIn) return <div>Non sei loggato</div>;
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl text-text-cta font-bold my-16">
          📈 Ciao {user.firstName}, ecco il tuo andamento!
        </h1>
        <div className="bg-white rounded-lg px-24 py-10 border border-cardborder min-h-[60vh]">
          <label htmlFor="selectSubject" className="text-text-extralight">
            Materia
          </label>
          <select
            id="selectSubject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-max p-3 rounded-lg text-xl font-semibold"
          >
            <option value="completo">Test completo</option>
            <option value="breve">Test breve</option>
            <option value="biologia">Biologia</option>
            <option value="chimica">Chimica</option>
            <option value="fisica">Fisica</option>
            <option value="lettura">Comprensione ed analisi del testo</option>
            <option value="logica">Logica</option>
          </select>
          <table
            className="w-full border-separate rounded-2xl mt-8"
            border={0}
            cellSpacing={0}
            cellPadding={0}
          >
            <thead>
              <tr>
                <th>🟢 Corrette</th>
                <th>🔴 Errate</th>
                <th>🟡 Omesse</th>
                <th>Data/ora</th>
                <th></th>
              </tr>
            </thead>
            <div className="h-2"></div>
            <tbody className="rounded-2xl">
              {trendData.map((test, i) => (
                <tr key={test.id} className={`text-center`}>
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
                      i == trendData.length - 1 ? "!border-b-cardborder" : ""
                    }`}
                  >
                    {test.wrongQuestions.length}
                  </td>
                  <td
                    className={`${defaultTableDataClass} ${
                      i == trendData.length - 1 ? "!border-b-cardborder" : ""
                    }`}
                  >
                    {test.notAnsweredQuestions.length}
                  </td>
                  <td
                    className={`${defaultTableDataClass} ${
                      i == trendData.length - 1 ? "!border-b-cardborder" : ""
                    }`}
                  >
                    {new Date(test.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className={`${defaultTableDataClass} border-r-cardborder ${
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
                      visualizza
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
