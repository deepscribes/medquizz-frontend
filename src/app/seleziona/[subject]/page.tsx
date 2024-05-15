"use client";

import { Navbar } from "@/components/navbar";
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

type SubjectCap = {
  [key: string]: number;
};

const subjectCap: SubjectCap = {
  biologia: 1190,
  chimica: 1015,
  fisica: 770,
  logica: 280,
  lettura: 245,
};

function getSubjectCap(subject: string): number {
  return subjectCap[subject] || 245;
}

enum Active {
  Count,
  FromTo,
}

export default function Page({ params }: { params: { subject: string } }) {
  const [questionCount, setQuestionCount] = useState(0);
  const [active, setActive] = useState<Active>(Active.Count);
  const [from, setFrom] = useState<string>("0");
  const [to, setTo] = useState<string>("0");

  const subjectCap = getSubjectCap(params.subject as Subject);

  const deactivatedClasses = "text-gray-400 cursor-not-allowed bg-opacity-50";

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
      <Navbar />
      <main className="text-center py-12 w-full max-w-4xl mx-auto px-8">
        <div className="flex flex-col items-center gap-y-2 bg-white max-w-2xl w-full p-16 rounded-xl border-cardborder border mx-auto">
          <label
            className={`block text-lg font-semibold text-center ${
              active == Active.Count ? "" : deactivatedClasses
            }`}
            htmlFor="number"
          >
            Numero di domande: {questionCount}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={questionCount}
            onClick={() => setActive(Active.Count)}
            onChange={(e) => {
              setQuestionCount(parseInt(e.target.value));
            }}
            name="number"
            id="number"
            className={`w-full mt-4 ${
              active == Active.Count ? "" : deactivatedClasses
            }`}
          />
          <div className="flex flex-row justify-between w-full text-cardborder">
            <p>0</p>
            <p>100</p>
          </div>

          <p className="text-gray-700 my-14">OPPURE</p>

          <div className="flex flex-row gap-x-4 items-center font-semibold">
            <span>Da</span>
            <input
              className={`text-center min-w-12 max-w-16 h-8 bg-[#F7F7F7] border-cardborder border rounded ${
                active == Active.FromTo
                  ? ""
                  : deactivatedClasses + " bg-gray-300"
              }`}
              type="number"
              min={0}
              max={subjectCap}
              value={from}
              onClick={() => setActive(Active.FromTo)}
              onChange={(e) => {
                if (!e.target.value) setFrom("");
                parseInt(e.target.value) <= subjectCap
                  ? setFrom(parseInt(e.target.value).toString())
                  : setFrom(
                      parseInt(e.target.value.substring(1, 3)).toString()
                    );
              }}
            />
            <span>a</span>
            <input
              className={`text-center min-w-12 max-w-16 h-8 bg-[#F7F7F7] border-cardborder border rounded ${
                active == Active.FromTo
                  ? ""
                  : deactivatedClasses + " bg-gray-300"
              }`}
              type="number"
              min={0}
              max={subjectCap}
              value={to}
              onClick={() => setActive(Active.FromTo)}
              onChange={(e) => {
                if (!e.target.value) setTo("");
                parseInt(e.target.value) <= subjectCap
                  ? setTo(parseInt(e.target.value).toString())
                  : setTo(parseInt(e.target.value.substring(1, 3)).toString());
              }}
            />
            <span>della banca dati MUR</span>
          </div>
          <a
            href={`/test?from=${from}&to=${to}`}
            className="my-12"
            onClick={() => {
              localStorage.setItem(
                "from",
                active == Active.FromTo ? from : "0"
              );
              localStorage.setItem("to", active == Active.FromTo ? to : "0");
              localStorage.setItem(
                "questionCount",
                active == Active.Count ? questionCount.toString() : "0"
              );
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
      </main>
    </>
  );
}
