"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/question";
import { Timer } from "@/components/timer";
import { Answer, Question } from "@prisma/client";
import { useEffect, useState } from "react";

export default function PageSuspense() {
  const [questions, setQuestions] = useState<
    (Question & { answers: Answer[] })[]
  >([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isReview, setIsReview] = useState(false);

  useEffect(() => {
    const questions = localStorage.getItem("questions");
    const localSubject = localStorage.getItem("subject");
    const urlSubject = localStorage.getItem("subject") || "completo";
    localStorage.setItem("subject", urlSubject);
    if (questions && localSubject && localSubject === urlSubject) {
      try {
        setQuestions(JSON.parse(questions));
      } catch (err) {
        localStorage.clear();
        window.location.reload();
      }
    } else {
      fetch(`/api/getQuestions?subject=${urlSubject}`)
        .then((res) => res.json())
        .then((data) => {
          setQuestions(data.questions);
          localStorage.setItem("questions", JSON.stringify(data.questions));
        });
    }

    const review = localStorage.getItem("isReview");
    if (review) {
      setIsReview(true);
    }
  }, []);

  return (
    <>
      <Navbar isTesting={true} />
      <main>
        <div className="text-center my-6 max-w-4xl mx-auto px-8">
          {!isReview && (
            <Timer isReady={!!questions.length} questions={questions.length} />
          )}
          {questions.length ? ( // Only render the questions when they are loaded
            <QuestionRender
              setQuestionIndex={setQuestionIndex}
              questionIndex={questionIndex}
              question={questions[questionIndex]}
              count={questions.length}
              isReview={isReview}
            />
          ) : (
            <p>Caricamento...</p>
          )}
        </div>
      </main>
    </>
  );
}
