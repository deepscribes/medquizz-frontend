import type {
  Question as PrismaQuestion,
  Answer as PrismaAnswer,
} from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Modal } from "../textModal";
import { Answer } from "../Answer";
import { insertImageInText } from "@/lib";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function QuestionRender({
  setQuestionIndex,
  question,
  questionIndex,
  isReview = false,
}: {
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  question: PrismaQuestion & { answers: PrismaAnswer[] };
  questionIndex: number;
  isReview: boolean;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Load correct answers for review
  useEffect(() => {
    fetch("/api/getCorrectAnswers")
      .then((res) => res.json())
      .then((data) => setCorrectAnswers(data));
  }, []);

  // Load selected answer, if set, from localStorage
  useEffect(() => {
    const pastAnswer = localStorage.getItem(`question-${questionIndex}`);
    if (pastAnswer && !Number.isNaN(parseInt(pastAnswer))) {
      setSelectedAnswer(parseInt(pastAnswer));
    } else {
      setSelectedAnswer(null);
    }
  }, [questionIndex]);

  // When the selected answer changes, save it to localStorage
  useEffect(() => {
    if (selectedAnswer != null && !isReview) {
      localStorage.setItem(
        `question-${questionIndex}`,
        selectedAnswer.toString()
      );
    } else {
      localStorage.removeItem(`question-${questionIndex}`);
    }
  }, [selectedAnswer, questionIndex]);

  return (
    <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border border-cardborder">
      <small className="text-sm text-gray-500 text-left px-2">
        {capitalize(question.subject)} - #{question.number}
      </small>
      <h1 className="text-xl font-semibold text-left px-2">
        <select
          onChange={(e) => setQuestionIndex(parseInt(e.target.value) - 1)}
          value={questionIndex + 1}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>{" "}
        <span
          dangerouslySetInnerHTML={{
            __html: insertImageInText(question.question.trimStart()),
          }}
        ></span>
        {question.branoId && (
          <>
            <button
              className="text-primary underline focus-visible:outline-none"
              onClick={() => setShowModal(true)}
            >
              Mostra brano
            </button>
            {showModal && (
              <Modal
                hideModal={() => setShowModal(false)}
                show={showModal}
                branoId={question.branoId}
              />
            )}
          </>
        )}
      </h1>
      <div className="flex flex-col space-y-2">
        {question.answers.map((answer: PrismaAnswer) => (
          <button
            key={answer.id}
            className="p-2 rounded text-left"
            onClick={() => {
              setSelectedAnswer(answer.id == selectedAnswer ? null : answer.id);
            }}
            disabled={isReview}
          >
            <Answer
              answer={answer}
              isReview={isReview}
              isBlank={selectedAnswer == null}
              answerChar={String.fromCharCode(
                Math.min(
                  question.answers.map((a) => a.id).indexOf(answer.id),
                  25
                ) + 65
              )}
              selected={selectedAnswer == answer.id}
              isCorrect={isReview && correctAnswers.indexOf(answer.id) != -1}
            />
          </button>
        ))}
      </div>
      <div className="flex flex-row justify-between p-2">
        <button
          className={`text-[#999999] text-xl ${
            questionIndex == 0 && "opacity-0"
          }`}
          disabled={questionIndex == 0}
          onClick={() => setQuestionIndex((prev) => Math.max(prev - 1, 0))}
        >
          Indietro
        </button>
        <button
          className={`text-[#37B0FE] text-xl font-bold ${
            questionIndex == 59 && "opacity-0"
          }`}
          onClick={() => setQuestionIndex((prev) => Math.min(prev + 1, 60))}
          disabled={questionIndex == 59}
        >
          Avanti
        </button>
      </div>
    </div>
  );
}
