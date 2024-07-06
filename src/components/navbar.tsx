"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useCorrectQuestions } from "@/hooks/useCorrectQuestions";

type Props = Partial<HTMLElement> & {
  isTesting?: boolean;
  isHome?: boolean;
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

const links = [
  {
    name: "Testimionials",
    href: "#testimonials",
  },
  {
    name: "Funzionalità",
    href: "#features",
  },
  {
    name: "Prezzo",
    href: "#pricing",
  },
];

export function Navbar(props: Props) {
  const correctAnswers = useCorrectQuestions();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <>
      <nav className="flex items-center justify-between w-full p-5 bg-white text-text-cta shadow-md">
        <a href="/" className="text-lg md:text-2xl font-bold w-[180px]">
          🩺 <span className="inline">MedQuizz</span>
        </a>
        {props.isHome && (
          <div>
            {
              <ul className="hidden md:flex justify-between gap-x-4 w-[320px] text-text-gray">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="font-semibold text-sm md:text-base"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            }
          </div>
        )}
        {props.isTesting ? (
          <div className="flex flex-row gap-x-4 text-sm sm:text-base w-[180px]">
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
                  const startTime = parseInt(
                    searchParams.get("startTime") || "0"
                  );
                  const subject = searchParams.get("subject");
                  const excludePastQuestions = searchParams.get(
                    "excludePastQuestions"
                  );
                  router.push(
                    `/risultati?subject=${subject}&startTime=${startTime}&result=${points}&excludePastQuestions=${excludePastQuestions}&timeElapsed=${Math.round(
                      (Date.now() - startTime) / 1000
                    )}`
                  );
                }}
              >
                Consegna
              </button>
              <div className="w-full h-full bg-secondary rounded-lg absolute top-1 left-1 z-10 group-active:bg-green-700"></div>
            </div>
          </div>
        ) : (
          <div className="w-[180px]">
            <SignedIn>
              <div className="flex gap-x-4">
                <div className="flex-1 h-full"></div>
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center justify-center bg-cta font-semibold text-white px-4 py-2 rounded-xl text-center">
                <a href="/sign-up w-full text-center">Accedi</a>
              </div>
            </SignedOut>
          </div>
        )}
      </nav>
    </>
  );
}
