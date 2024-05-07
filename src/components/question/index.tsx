import type {
  Question as PrismaQuestion,
  Answer as PrismaAnswer,
} from "@prisma/client";
import React, { useEffect, useState } from "react";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Modal({
  show,
  branoId,
  hideModal,
}: {
  branoId: string;
  show: boolean;
  hideModal: () => void;
}) {
  const [brano, setBrano] = useState("");

  useEffect(() => {
    fetch(`https://domande-ap.mur.gov.it/api/v1/domanda/brano/${branoId}`)
      .then((res) => res.json())
      .then((data) => setBrano(data.brano));
  }, [branoId]);
  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className={`${
        !show && "hidden"
      } flex overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 max-h-[calc(100%-1rem)] bg-black bg-opacity-50`}
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow max-h-[80vh] overflow-y-auto">
          <button className="px-4 pt-4 mr-0 ml-auto" onClick={hideModal}>
            X
          </button>
          <div className="p-4 space-y-4">
            <p className="text-base leading-relaxed text-gray-500">{brano}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewAnswer({
  answer,
  isCorrect,
  answerChar,
  selected,
  isBlank,
}: {
  answer: PrismaAnswer;
  isCorrect: boolean;
  selected: boolean;
  answerChar: string;
  isBlank: boolean;
}) {
  return (
    <div
      className={`flex flex-row gap-x-4 items-center p-4 border-cardborder ${
        isCorrect && "bg-[#E6F7E6] border-[#34B634] text-white"
      } ${
        selected && !isCorrect && "bg-[#FDD2D2] border-[#FA4343] text-black"
      } border rounded-md`}
    >
      <div
        className={`flex w-12 h-12 text-center justify-center items-center font-extrabold text-xl border border-cardborder ${
          isCorrect && "bg-[#34B634]"
        } ${
          selected && !isCorrect && "bg-[#FA4343] text-white"
        } rounded-md capitalize`}
      >
        {answerChar}
      </div>
      <p
        className="flex-shrink-[3] text-black"
        dangerouslySetInnerHTML={{ __html: answer.text }}
      ></p>
      <p className="text-black mr-0 ml-auto font-semibold">
        {selected && isCorrect
          ? "+1.5" // Selected answer is correct
          : selected && !isCorrect
          ? "-0.4" // Selected answer is wrong
          : ""}
        {
          isBlank &&
            isCorrect &&
            "0" /* If the answer was left blank, put a "0" in the correct answer */
        }
      </p>
    </div>
  );
}

function Answer({
  answer,
  selected,
  isCorrect = false,
  answerChar,
  isReview,
  isBlank,
}: {
  answerChar: string;
  answer: PrismaAnswer;
  selected: boolean;
  isCorrect: boolean;
  isReview: boolean;
  isBlank: boolean;
}) {
  if (isReview) {
    return (
      <ReviewAnswer
        answer={answer}
        isCorrect={isCorrect}
        selected={selected}
        answerChar={answerChar}
        isBlank={isBlank}
      />
    );
  }
  return (
    <>
      <div
        className={`flex flex-row gap-x-4 items-center p-4 ${
          selected ? "bg-[#E0F2FF]" : "bg-[#F7F7F7]"
        } ${
          selected ? "border-primary" : "border-[#9D9D9D]"
        } border rounded-md`}
      >
        <div
          className={`flex w-12 h-12 text-center justify-center items-center font-extrabold text-xl ${
            selected ? "bg-primary text-white" : "bg-white text-black"
          } ${!selected && "border"} border-cardborder rounded-md capitalize`}
        >
          {answerChar}
        </div>
        <p
          className="flex-shrink-[3]"
          dangerouslySetInnerHTML={{ __html: answer.text }}
        ></p>
      </div>
    </>
  );
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

  useEffect(() => {
    fetch("/api/getCorrectAnswers")
      .then((res) => res.json())
      .then((data) => setCorrectAnswers(data));
  }, []);

  useEffect(() => {
    const pastAnswer = localStorage.getItem(`question-${questionIndex}`);
    if (pastAnswer && !Number.isNaN(parseInt(pastAnswer))) {
      setSelectedAnswer(parseInt(pastAnswer));
    }
  }, [questionIndex]);

  useEffect(() => {
    if (selectedAnswer != null) {
      localStorage.setItem(
        `question-${questionIndex}`,
        selectedAnswer.toString()
      );
    } else {
      localStorage.removeItem(`question-${questionIndex}`);
    }
  }, [selectedAnswer]);

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
        </select>
        {question.question}
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
        {question.answers.map((answer: PrismaAnswer, i: number) => (
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
