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

function getCharCodeFromAnswer(
  answer: PrismaAnswer | undefined,
  question: PrismaQuestion & { answers: PrismaAnswer[] }
) {
  if (answer == undefined) return "A";
  return String.fromCharCode(
    Math.min(question.answers.map((a) => a.id).indexOf(answer.id), 25) + 65
  );
}

/**
 * Since the order of the answers is random, we need to replace the correct letter with the correct answer.
 * For security, it will replace all occurrences like [A], [a], A) or a) with the correct letter.
 * @param text The response from OpenAI
 * @param correctLetter The correct letter (A, B, C, D or E)
 * @returns The response with the correct letter replaced with the correct answer
 */
function fixCorrectLetter(text: string, correctLetter: string) {
  return text
    .replaceAll("[A]", "[" + correctLetter + "]")
    .replaceAll("[a]", "[" + correctLetter + "]")
    .replaceAll("A)", correctLetter + ")")
    .replaceAll("a)", correctLetter + ")")
    .replaceAll("[B]", "[" + correctLetter + "]")
    .replaceAll("[b]", "[" + correctLetter + "]")
    .replaceAll("B)", correctLetter + ")")
    .replaceAll("b)", correctLetter + ")")
    .replaceAll("[C]", "[" + correctLetter + "]")
    .replaceAll("[c]", "[" + correctLetter + "]")
    .replaceAll("C)", correctLetter + ")")
    .replaceAll("c)", correctLetter + ")")
    .replaceAll("[D]", "[" + correctLetter + "]")
    .replaceAll("[d]", "[" + correctLetter + "]")
    .replaceAll("D)", correctLetter + ")")
    .replaceAll("d)", correctLetter + ")")
    .replaceAll("[E]", "[" + correctLetter + "]")
    .replaceAll("[e]", "[" + correctLetter + "]")
    .replaceAll("E)", correctLetter + ")")
    .replaceAll("e)", correctLetter + ")");
}

export function QuestionRender({
  setQuestionIndex,
  question,
  questionIndex,
  count,
  isReview = false,
}: {
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  question: PrismaQuestion & { answers: PrismaAnswer[] };
  questionIndex: number;
  isReview: boolean;
  count: number;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationCharIndex, setExplanationCharIndex] = useState<number>(0);
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);

  // Load correct answers for review
  useEffect(() => {
    fetch("/api/getCorrectAnswers")
      .then((res) => res.json())
      .then((data) => setCorrectAnswers(data));
  }, []);

  // Increase explanationCharIndex every 0.1 seconds
  useEffect(() => {
    if (explanation) {
      const interval = setInterval(() => {
        setExplanationCharIndex((prev) =>
          Math.min(prev + 1, explanation.length)
        );
        if (explanationCharIndex >= explanation.length) clearInterval(interval);
      }, 25);
      return () => {
        clearInterval(interval);
        setExplanationCharIndex(0);
      };
    }
  }, [explanation, questionIndex]);

  useEffect(() => {
    // Reset the explanation and selected answer when the question changes
    setExplanation(null);
    setExplanationCharIndex(0);
    setIsExplanationExpanded(false);
    // Load selected answer, if set, from localStorage
    const pastAnswer = localStorage.getItem(`question-${questionIndex}`);
    if (pastAnswer && !Number.isNaN(parseInt(pastAnswer))) {
      setSelectedAnswer(parseInt(pastAnswer));
    } else {
      setSelectedAnswer(null);
    }
  }, [questionIndex]);

  // When the selected answer changes, save it to localStorage
  useEffect(() => {
    if (isReview) return; // If in review mode, don't change localStorage
    if (selectedAnswer != null) {
      // If an answer has been set, save it
      localStorage.setItem(
        `question-${questionIndex}`,
        selectedAnswer.toString()
      );
    } else {
      // Otherwise, remove it
      localStorage.removeItem(`question-${questionIndex}`);
    }
  }, [selectedAnswer, questionIndex, isReview]);

  return (
    <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border border-cardborder">
      <div className="flex justify-between items-center gap-x-2">
        <small className="text-sm text-gray-500 text-left px-2">
          {capitalize(question.subject)} - #{question.number}
        </small>
        <button
          className="text-gray-500 text-sm"
          onClick={() => {
            if (confirm("Vuoi segnalare questa domanda come errata?"))
              fetch("/api/reportQuestion", {
                method: "POST",
                body: JSON.stringify({ questionId: question.id }),
                headers: {
                  "Content-Type": "application/json",
                },
              });
          }}
        >
          <span className="hidden sm:inline">Segnala</span>{" "}
          <span className="text-lg">⚑</span>
        </button>
      </div>
      <h1 className="text-xl font-semibold text-left px-2">
        <select
          onChange={(e) => setQuestionIndex(parseInt(e.target.value) - 1)}
          value={questionIndex + 1}
        >
          {Array.from({ length: count }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>{" "}
        <span
          dangerouslySetInnerHTML={{
            __html: insertImageInText(
              question.question.trimStart(),
              question.subject
            ),
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
              subject={question.subject}
              answer={answer}
              isReview={isReview}
              isBlank={selectedAnswer == null}
              answerChar={getCharCodeFromAnswer(answer, question)}
              selected={selectedAnswer == answer.id}
              isCorrect={isReview && correctAnswers.indexOf(answer.id) != -1}
            />
          </button>
        ))}
      </div>
      {/* Spiegazione */}
      <div>
        {isReview && (
          <div className="flex flex-col m-2 p-4 bg-primary-light rounded-lg">
            <div className="flex flex-row justify-between">
              <h2 className="text-lg font-bold text-left px-2 text-[#14435E]">
                ✨ Spiegazione{" "}
                <span className="text-sm ml-4 font-light italic">
                  powered by GPT-4
                </span>
              </h2>
              <button
                onClick={() => {
                  setIsExplanationExpanded((prev) => !prev);
                  // Fetch the explanation from our API
                  !explanation &&
                    fetch(`/api/getExplanation?id=${question.id}`)
                      .then((res) => res.json())
                      .then((data) => setExplanation(data.text))
                      .catch((err) => setExplanation(err.toString()));
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path d="M12 12.586 8.707 9.293l-1.414 1.414L12 15.414l4.707-4.707-1.414-1.414L12 12.586z" />
                </svg>
              </button>
            </div>
            <div className="text-[#1A2B4C96]">
              {/* Only show the explanation if isExplanationExpanded is true */}
              {isExplanationExpanded &&
                (explanation ? ( // If the explanation is loaded, show it
                  <p
                    className="my-6 text-left px-2"
                    dangerouslySetInnerHTML={{
                      __html: fixCorrectLetter(
                        explanation,
                        getCharCodeFromAnswer(
                          question.answers.find((a) => a.isCorrect),
                          question
                        )
                      ).substring(0, explanationCharIndex),
                    }}
                  />
                ) : (
                  // Otherwise show a loading message
                  <p className="my-6 text-left px-2">Caricamento...</p>
                ))}
            </div>
          </div>
        )}
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
            questionIndex == count - 1 && "opacity-0"
          }`}
          onClick={() => setQuestionIndex((prev) => Math.min(prev + 1, 60))}
          disabled={questionIndex == count - 1}
        >
          Avanti
        </button>
      </div>
    </div>
  );
}
