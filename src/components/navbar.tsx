"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SignedIn, SignedOut, useAuth, UserButton } from "@clerk/nextjs";
import { renderToStaticMarkup } from "react-dom/server";
import { useCorrectAnswers } from "@/hooks/useCorrectAnswers";
import { useUser } from "@/hooks/useUser";
import { PlanFactoryWithProps } from "./Plans";

type Props = Partial<HTMLElement> & {
  isTesting?: boolean;
  isHome?: boolean;
};

const userSVG = (
  <svg
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 45.532 45.532"
    xmlSpace="preserve"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <g>
        <path d="M22.766,0.001C10.194,0.001,0,10.193,0,22.766s10.193,22.765,22.766,22.765c12.574,0,22.766-10.192,22.766-22.765 S35.34,0.001,22.766,0.001z M22.766,6.808c4.16,0,7.531,3.372,7.531,7.53c0,4.159-3.371,7.53-7.531,7.53 c-4.158,0-7.529-3.371-7.529-7.53C15.237,10.18,18.608,6.808,22.766,6.808z M22.761,39.579c-4.149,0-7.949-1.511-10.88-4.012 c-0.714-0.609-1.126-1.502-1.126-2.439c0-4.217,3.413-7.592,7.631-7.592h8.762c4.219,0,7.619,3.375,7.619,7.592 c0,0.938-0.41,1.829-1.125,2.438C30.712,38.068,26.911,39.579,22.761,39.579z"></path>{" "}
      </g>
    </g>
  </svg>
);

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
    name: "FAQ",
    href: "#faq",
  },
];

export function Navbar(props: Props) {
  const { userId } = useAuth();
  const correctAnswers = useCorrectAnswers();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();

  function addProfileLink() {
    // Use some javascript to dynamically add a link to the user button in the navbar
    if (!userId) return; // If the user is not logged in, the user button is not rendered so we don't need to do anything
    const buttonWrapper = document.querySelector(
      ".cl-userButtonPopoverActions"
    );
    if (!buttonWrapper) {
      return;
    }
    const link = document.createElement("a");
    link.href = "/profilo";
    link.className = "clerk-user-button";
    const div = document.createElement("div");
    div.className = "clerk-user-svg";
    const svg = document.createElement("svg");
    svg.setAttribute("width", "12");
    svg.setAttribute("height", "12");
    svg.className = "w-3 h-3";
    svg.innerHTML = renderToStaticMarkup(userSVG);
    div.appendChild(svg);
    link.appendChild(div);
    link.appendChild(document.createTextNode("Storico simulazioni"));
    buttonWrapper.prepend(link);
  }

  return (
    <>
      <nav className="flex items-center justify-between w-full p-5 bg-white text-text-cta shadow-md lg:px-[12.5%]">
        <div className="flex flex-row gap-x-4">
          <a
            href="/"
            className="flex flex-row gap-x-2 items-center text-lg md:text-2xl font-bold"
          >
            🩺 <span className="inline">MedQuizz</span>
          </a>
          <PlanFactoryWithProps plan={user?.plan} />
        </div>
        <div className="flex flex-row items-center justify-center gap-x-4">
          {props.isHome && (
            <div>
              {
                <ul className="hidden md:flex justify-between gap-x-4 text-text-gray">
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
            <div className="flex flex-row gap-x-4 text-sm sm:text-base w-min">
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
                    if (!userId) {
                      router.push("/sign-up");
                      return;
                    }
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
            <div>
              <SignedIn>
                <div className="flex gap-x-4" onClick={addProfileLink}>
                  <div className="flex-1 h-full"></div>
                  <UserButton />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex items-center justify-center bg-cta font-semibold text-white px-4 py-2 rounded-xl text-center">
                  <a href="/sign-up">Accedi</a>
                </div>
              </SignedOut>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
