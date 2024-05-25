"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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
  return Math.round(res * 100) / 100;
}

export function Navbar(props: Props) {
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (props.isTesting) {
      // Load correct answers from localStorage or fetch them
      const answers = localStorage.getItem("correctAnswers");
      if (answers) {
        setCorrectAnswers(JSON.parse(answers));
      } else {
        fetch("/api/getCorrectAnswers")
          .then((res) => res.json())
          .then((data) => setCorrectAnswers(data));
      }
    }
  }, [props.isTesting]);
  return (
    <>
      <nav className="flex items-center justify-between w-full p-5 bg-white text-cta shadow-md">
        <a href="/" className="text-lg md:text-2xl font-bold">
          🩺 <span className="inline">MedQuizz</span>
        </a>
        {props.isTesting ? (
          <div className="flex flex-row gap-x-4 text-sm sm:text-base">
            <button
              className="px-3 py-1 sm:px-6 sm:py-3 rounded-md border border-primary text-primary font-semibold"
              onClick={() => {
                localStorage.clear();
                router.push("/seleziona");
              }}
            >
              Chiudi
            </button>
            <div className="w-full flex items-center justify-center relative group">
              <button
                className="mx-auto font-semibold p-3 sm:px-8 bg-primary text-white rounded-lg relative z-20 group-active:bg-primary-pressed"
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
          <>
            <>
              <SignedIn>
                <div className="flex gap-x-4">
                  <UserButton />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex items-center bg-cta font-semibold text-white px-4 py-2 rounded-full">
                  <a href="/sign-up">Accedi</a>
                </div>
              </SignedOut>
            </>
          </>
        )}
      </nav>
    </>
  );
}
