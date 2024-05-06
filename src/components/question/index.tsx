import type {
  Question as PrismaQuestion,
  Answer as PrismaAnswer,
} from "@prisma/client";
import React, { useEffect, useState } from "react";
import Select from "react-select";

function Answer({
  answer,
  selected,
  isIncorrect = false,
}: {
  answer: PrismaAnswer;
  selected: boolean;
  isIncorrect: boolean;
}) {
  return (
    <>
      <div
        className={`flex flex-row gap-x-4 items-center p-4 ${
          selected ? "bg-[#E0F2FF]" : "bg-[#F7F7F7]"
        } ${selected ? "border-[#37B0FE]" : "border-[#9D9D9D]"} ${
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
          {answer.id}
        </div>
        <p className="">{answer.text}</p>
      </div>
    </>
  );
}

export function QuestionRender({
  setQuestionIndex,
  question,
  questionIndex,
  isReview = false,
  submittedKey = null,
}: {
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  question: PrismaQuestion & { answers: PrismaAnswer[] };
  questionIndex: number;
  isReview: boolean;
  submittedKey: string | null;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    const pastAnswer = localStorage.getItem(`question-${questionIndex}`);
    if (pastAnswer && !Number.isNaN(parseInt(pastAnswer))) {
      setSelectedAnswer(parseInt(pastAnswer));
    }
  }, []);
  return (
    <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border boder-[#B3B3B3]">
      <small className="text-sm text-gray-500 text-left">
        {question.subject}
      </small>
      <h1 className="text-xl font-bold text-left">
        <select
          onChange={(e) => setQuestionIndex(parseInt(e.target.value) - 1)}
        >
          {Array.from({ length: 90 }, (_, i) => (
            <option key={i} value={i + 1} selected={i == questionIndex}>
              {i + 1}
            </option>
          ))}
        </select>
        . {question.question}
      </h1>
      <div className="flex flex-col space-y-2">
        {question.answers.map((answer: PrismaAnswer) => (
          <button
            key={answer.id}
            className="p-2 rounded text-left"
            onClick={() => {
              localStorage.setItem(
                `question-${questionIndex}`,
                answer.id.toString()
              );
              setSelectedAnswer(answer.id);
            }}
            disabled={isReview}
          >
            <Answer
              answer={answer}
              selected={false}
              isIncorrect={isReview && selectedAnswer == answer.id}
            />
          </button>
        ))}
      </div>
      <div className="flex flex-row justify-between p-2">
        <button className="text-[#999999] text-xl">Indietro</button>
        <button className="text-[#37B0FE] text-xl font-bold">Avanti</button>
      </div>
    </div>
  );
}
