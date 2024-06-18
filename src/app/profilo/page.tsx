"use client";

import { useUser } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
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
            className="block w-max p-3 rounded-lg text-xl font-semibold"
          >
            <option value="1">Anatomia</option>
            <option value="2">Fisiologia</option>
            <option value="3">Patologia</option>
          </select>
        </div>
      </div>
    </>
  );
}
