import type {
  Question as PrismaQuestion,
  Answer as PrismaAnswer,
} from "@prisma/client";
import React, { useEffect, useState } from "react";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Answer({
  answer,
  selected,
  isIncorrect = false,
  answerChar,
}: {
  answerChar: string;
  answer: PrismaAnswer;
  selected: boolean;
  isIncorrect: boolean;
}) {
  return (
    <>
      <div
        className={`flex flex-row gap-x-4 items-center p-4 ${
          selected ? "bg-[#E0F2FF]" : "bg-[#F7F7F7]"
        } ${selected ? "border-primary" : "border-[#9D9D9D]"} ${
          isIncorrect && "!bg-[#FDD2D2] !border-[#FA4343]"
        } border rounded-md`}
      >
        <div
          className={`flex w-12 h-12 text-center justify-center items-center font-extrabold text-xl ${
            selected ? "bg-primary text-white" : "bg-white text-black"
          } border border-gray-500 ${
            isIncorrect && "bg-[#FA4343] text-white border-none"
          } rounded-md capitalize`}
        >
          {answerChar}
        </div>
        <p className="flex-shrink-[3]">{answer.text}</p>
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
    <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border boder-[#B3B3B3]">
      <small className="text-sm text-gray-500 text-left px-2">
        {capitalize(question.subject)}
      </small>
      <h1 className="text-xl font-bold text-left px-2">
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
              answerChar={String.fromCharCode(
                Math.min(
                  question.answers.map((a) => a.id).indexOf(answer.id),
                  25
                ) + 65
              )}
              selected={selectedAnswer == answer.id}
              isIncorrect={isReview && selectedAnswer == answer.id}
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
