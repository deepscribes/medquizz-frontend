"use client";

import { Navbar } from "@/components/navbar";
import { get } from "http";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// TODO: Update isSubject when changing this
type Subject = "biologia" | "chimica" | "fisica" | "logica" | "lettura";

function isSubject(subject: string): subject is Subject {
  console.log(subject);
  return ["biologia", "chimica", "fisica", "logica", "lettura"].includes(
    subject
  );
}

function getSubjectCap(subject: string): number {
  return 150;
}

export default function Page({ params }: { params: { subject: string } }) {
  const [number, setNumber] = useState(0);
  const [from, setFrom] = useState<string>("0");
  const [to, setTo] = useState<string>("0");

  const subjectCap = getSubjectCap(params.subject as Subject);

  const router = useRouter();

  if (!isSubject(params.subject)) {
    alert("Materia non valida, riportando alla pagina iniziale");
    router.push("/seleziona");
  }

  useEffect(() => {
    if (from == "" || to == "") return;
    if (parseInt(from) > parseInt(to)) {
      setTo(from);
    }
  }, [to, from]);

  return (
    <>
      <Navbar isTesting={false} />
      <div className="flex flex-col items-center gap-y-2 bg-white max-w-2xl w-full mx-auto my-12 p-16 rounded-xl border-cardborder border">
        <label
          className="block text-lg font-semibold text-center"
          htmlFor="number"
        >
          Numero di domande: {number}
        </label>
        <input
          type="range"
          min={0}
          max={60}
          step={1}
          value={number}
          onChange={(e) => setNumber(parseInt(e.target.value))}
          name="number"
          id="number"
          className="w-full mt-4"
        />
        <div className="flex flex-row justify-between w-full text-cardborder">
          <p className="flex-grow">0</p>
          <p>60</p>
        </div>

        <p className="text-gray-700 my-14">OPPURE</p>

        <div className="flex flex-row gap-x-4 items-center font-semibold">
          <span>Da</span>
          <input
            className="text-center min-w-12 max-w-16 h-8 bg-[#F7F7F7] border-cardborder border rounded"
            type="number"
            min={0}
            max={subjectCap}
            value={from}
            onChange={(e) => {
              if (!e.target.value) setFrom("");
              parseInt(e.target.value) <= subjectCap
                ? setFrom(parseInt(e.target.value).toString())
                : setFrom(parseInt(e.target.value.substring(1, 3)).toString());
            }}
          />
          <span>a</span>
          <input
            className="text-center min-w-12 max-w-16 h-8 bg-[#F7F7F7] border-cardborder border rounded"
            type="number"
            min={0}
            max={subjectCap}
            value={to}
            onChange={(e) => {
              if (!e.target.value) setTo("");
              parseInt(e.target.value) <= subjectCap
                ? setTo(parseInt(e.target.value).toString())
                : setTo(parseInt(e.target.value.substring(1, 3)).toString());
            }}
          />
          <span>della banca ufficiale MUR</span>
        </div>
        <a
          href={`/test?from=${from}&to=${to}`}
          className="my-12"
          onClick={() => {
            localStorage.setItem("from", from);
            localStorage.setItem("to", to);
            localStorage.setItem("questionCount", number.toString());
          }}
        >
          <div className="w-full flex items-center justify-center relative group">
            <p className="mx-auto font-semibold p-3 sm:px-8 bg-primary text-white rounded-lg relative z-20 group-active:bg-primary-pressed">
              👉 Genera QUIZ!
            </p>
            <div className="w-full h-full bg-secondary rounded-lg absolute top-1 left-1 z-10 group-active:bg-green-700"></div>
          </div>
        </a>
      </div>
    </>
  );
}
