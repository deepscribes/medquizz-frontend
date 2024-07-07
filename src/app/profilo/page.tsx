"use client";

import { useUser } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { Test } from "@prisma/client";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [subject, setSubject] = useState("completo");
  const [trendData, setTrendData] = useState<Test[]>([]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const res = await fetch(`/api/userData/test?subject=${subject}`);
      const data = await res.json();
      setTrendData(data);
    })();
  }, [subject, isLoaded, isSignedIn]);

  if (!isLoaded) return null;
  if (!isSignedIn) return null;
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
          {trendData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {trendData.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-lg p-4 border border-cardborder"
                >
                  <h2 className="text-xl font-semibold text-text-cta flex flex-row justify-between">
                    <span>
                      {test.score as unknown as number}/
                      {test.maxScore as unknown as number}{" "}
                    </span>
                    <span>
                      {Math.round(
                        ((test.score as unknown as number) /
                          (test.maxScore as unknown as number)) *
                          100
                      )}
                      %
                    </span>
                  </h2>
                  <p className="text-text-extralight">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-extralight mt-4">
              Nessun test effettuato per questa materia
            </p>
          )}
        </div>
      </div>
    </>
  );
}
