"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = Partial<HTMLElement> & {
  isTesting?: boolean;
};

function getPoints(correctAnswers: number[], answers: number[]) {
  let res = 0;
  for (const answer of answers) {
    if (correctAnswers.includes(answer)) {
      res += 1.5;
    } else {
      res -= 0.4;
    }
  }
  return Math.round(res * 10) / 10;
}

export function Navbar(props: Props) {
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (props.isTesting)
      fetch("/api/getCorrectAnswers")
        .then((res) => res.json())
        .then((data) => setCorrectAnswers(data));
  }, [props.isTesting]);
  return (
    <>
      <nav className="flex items-center justify-between w-full p-5 bg-white text-gray-800 shadow-md">
        <a href="/" className="text-lg md:text-2xl font-bold">
          🩺 <span className="hidden sm:inline">MedQuizz</span>
        </a>
        {props.isTesting ? (
          <div className="flex flex-row gap-x-4">
            <button
              className="px-6 py-3 rounded-md border border-primary text-primary font-semibold"
              onClick={() => {
                localStorage.clear();
                router.push("/");
              }}
            >
              Chiudi
            </button>
            <div className="w-full flex items-center justify-center relative group">
              <button
                className="mx-auto font-semibold p-3 px-8 bg-primary text-white rounded-lg relative z-20 group-active:bg-primary-pressed"
                onClick={() => {
                  const points = getPoints(
                    correctAnswers,
                    Object.keys(localStorage)
                      .filter((k) => k.startsWith("question-"))
                      .map((k) => parseInt(localStorage.getItem(k)!))
                  );
                  if (!localStorage.getItem("end")) {
                    localStorage.setItem("end", Date.now().toString());
                  }
                  router.push(
                    `/risultati?r=${points}&t=${localStorage.getItem("end")}`
                  );
                }}
              >
                Consegna
              </button>
              <div className="w-full h-full bg-secondary rounded-lg absolute top-1 left-1 z-10 group-active:bg-green-700"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4 font-bold text-[#414288]">
            <a href="https://discord.gg/QQ7JpWFr5D">Unisciti alla community!</a>
          </div>
        )}
      </nav>
    </>
  );
}
