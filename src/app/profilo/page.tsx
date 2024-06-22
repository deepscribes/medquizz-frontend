"use client";

import { useUser } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return null;

  const [subject, setSubject] = useState("completo");
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/userData/trend?subject=${subject}`);
      const data = await res.json();
      console.log(data);
    })();
  }, [subject]);
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
        </div>
      </div>
    </>
  );
}
