import type {
  Question as PrismaQuestion,
  Answer as PrismaAnswer,
} from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Answer } from "../Answer";
import { formatTextForTest } from "@/lib";
import { MathJax } from "better-react-mathjax";
import { useCorrectAnswers } from "@/hooks/useCorrectAnswers";
import { useReview, ReviewType } from "@/hooks/useReview";

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

function markdownBoldToHTML(input: string) {
  return input.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

/**
 * Since the order of the answers is random, we need to replace the correct letter with the correct answer.
 * For security, it will replace all occurrences like [A] or A) with the correct letter.
 * @param text The response from OpenAI
 * @param correctLetter The correct letter (A, B, C, D or E)
 * @returns The response with the correct letter replaced with the correct answer
 */
function fixCorrectLetter(text: string, correctLetter: string) {
  return text.replaceAll("[FAVA]", "[" + correctLetter + "]");
}

export function QuestionRender({
  setQuestionIndex,
  question,
  questionIndex,
  count,
}: {
  setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  question: PrismaQuestion & { answers: PrismaAnswer[] };
  questionIndex: number;
  count: number;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const correctAnswers = useCorrectAnswers();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationCharIndex, setExplanationCharIndex] = useState<number>(0);
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);
  const { review, setReview } = useReview();

  // Increase explanationCharIndex every 0.1 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (explanation) {
      interval = setInterval(() => {
        setExplanationCharIndex((prev) => {
          const newIndex = prev + 1;
          if (newIndex >= explanation.length) {
            clearInterval(interval);
          }
          return newIndex;
        });
      }, 10);
    }
    return () => {
      clearInterval(interval);
      setExplanationCharIndex(0);
    };
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
    if (review) return; // If in review mode, don't change localStorage
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
  }, [selectedAnswer, questionIndex, review]);

  return (
    <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border border-cardborder">
      <div className="flex justify-between items-center gap-x-2">
        <small className="text-sm text-gray-500 text-left px-2">
          {capitalize(question.subject)} - #{question.number}
        </small>
        <div className="text-gray-500 text-sm relative flex flex-row">
          <span className="hidden sm:inline xl:hidden">Mostra soluzione</span>
          <img
            role="button"
            aria-label="Visualizza spiegazione"
            onClick={() => {
              setReview((prev) => {
                if (prev == ReviewType.AfterTest) {
                  return prev;
                }
                if (prev == ReviewType.False) {
                  return ReviewType.DuringTest;
                }
                return ReviewType.False;
              });
            }}
            src="https://medquizz.s3.eu-south-1.amazonaws.com/icons/eye.png"
            width={16}
            height={16}
            className="w-6 h-6 mx-2"
          />
          <div className="absolute left-full -top-1 w-48 hidden xl:block">
            <img
              className="w-24 aspect-square scale-x-[-1]"
              src="https://medquizz.s3.eu-south-1.amazonaws.com/icons/arrow.png"
              alt=""
              aria-hidden
            />
            <p className="relative left-6 text-text-cta font-Schoolbell -rotate-[11deg] -top-3">
              Clicca qui per visualizzare la soluzione commentata dall&apos;AI
            </p>
          </div>
        </div>
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
        <MathJax>
          <span
            dangerouslySetInnerHTML={{
              __html: formatTextForTest(question.question),
            }}
          ></span>
        </MathJax>
      </h1>
      <div className="flex flex-col space-y-2">
        {question.answers.map((answer: PrismaAnswer) => (
          <button
            key={answer.id}
            className="p-2 rounded text-left"
            onClick={() => {
              setSelectedAnswer(answer.id == selectedAnswer ? null : answer.id);
            }}
            disabled={review !== ReviewType.False}
          >
            <Answer
              answer={answer}
              isBlank={selectedAnswer == null}
              answerChar={getCharCodeFromAnswer(answer, question)}
              selected={selectedAnswer == answer.id}
              isCorrect={
                review !== ReviewType.False &&
                correctAnswers.indexOf(answer.id) != -1
              }
            />
          </button>
        ))}
      </div>
      {/* Spiegazione */}
      <div>
        {review !== ReviewType.False && (
          <div className="flex flex-col m-2 p-4 bg-primary-light rounded-lg">
            <div className="flex flex-row justify-between">
              <h2 className="text-lg font-bold text-left px-2 text-[#14435E]">
                ✨ Spiegazione{" "}
                <span className="text-sm ml-4 font-light italic">
                  powered by Claude 3.5
                </span>
              </h2>
              <button
                onClick={() => {
                  setIsExplanationExpanded((prev) => !prev);
                  // Fetch the explanation from our API
                  !explanation &&
                    fetch(`/api/getExplanation?id=${question.id}`)
                      .then((res) => res.json())
                      .then((data) =>
                        setExplanation(markdownBoldToHTML(data.text))
                      )
                      .catch((err) => setExplanation(err.toString()));
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path d="M12 12.586 8.707 9.293l-1.414 1.414L12 15.414l4.707-4.707-1.414-1.414L12 12.586z" />
                </svg>
              </button>
            </div>
            <MathJax className="text-[#1A2B4C96]" inline dynamic>
              {/* Only show the explanation if isExplanationExpanded is true */}
              {isExplanationExpanded &&
                (explanation ? ( // If the explanation is loaded, show it
                  <p
                    className="my-6 text-left px-2 *:inline-block"
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
            </MathJax>
          </div>
        )}
      </div>
      <div className="flex flex-row justify-between p-2">
        <button
          className={`text-[#999999] text-xl ${
            questionIndex == 0 && "opacity-0"
          }`}
          disabled={questionIndex == 0}
          onClick={() => {
            setReview(ReviewType.False);
            setQuestionIndex((prev) => Math.max(prev - 1, 0));
          }}
        >
          Indietro
        </button>
        <button
          className={`text-[#37B0FE] text-xl font-bold ${
            questionIndex == count - 1 && "opacity-0"
          }`}
          onClick={() => {
            setReview(ReviewType.False);
            setQuestionIndex((prev) => Math.min(prev + 1, count - 1));
          }}
          disabled={questionIndex == count - 1}
        >
          Avanti
        </button>
      </div>
    </div>
  );
}
