"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/question";
import { Answer, Question } from "@prisma/client";
import { useEffect, useState } from "react";

function msToHMS(ms: number) {
  // 1- Convert to seconds:
  var seconds = ms / 1000;
  // 2- Extract hours:
  var hours = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  var minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = Math.floor(seconds % 60);
  return `${hours * 60 + minutes.toString().padStart(2, "0")}m:${seconds
    .toString()
    .padStart(2, "0")}s`;
}

export default function Page() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questions, setQuestions] = useState<
    (Question & { answers: Answer[] })[]
  >([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isReview, setIsReview] = useState(false);

  const testTime = 100 * 60 * 1000; // 100 minutes

  useEffect(() => {
    setIsReview(localStorage.getItem("isReview") === "true");
    const interval = setInterval(() => {
      // Get the start time from localStorage
      let start = localStorage.getItem("start");
      if (!start) {
        localStorage.setItem("start", Date.now().toString());
        start = Date.now().toString();
      }
      setTimeElapsed(Date.now() - parseInt(start));
    }, 1000);
    fetch("/api/getQuestions")
      .then((res) => res.json())
      .then((data) => setQuestions(data));

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar isTesting={true} />
      <main>
        <div className="text-center my-6 max-w-lg mx-auto">
          <p className="font-semibold my-8">
            ⏱️ Tempo rimanente:{" "}
            <span className="font-bold">{msToHMS(testTime - timeElapsed)}</span>
          </p>
          {questions.length ? (
            <QuestionRender
              setQuestionIndex={setQuestionIndex}
              questionIndex={questionIndex}
              question={questions[questionIndex]}
              isReview={isReview}
            />
          ) : (
            <div className="flex flex-col space-y-4 bg-white p-4 rounded-2xl border boder-[#B3B3B3]">
              <h1 className="text-xl font-bold m-8 text-center">
                Caricando domande, per favore aspettare...
              </h1>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
