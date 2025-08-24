import type { Answer as PrismaAnswer } from "@/types/db";
import { formatTextForTest } from "@/lib";
import { useReview } from "@/hooks/useReview";

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
      className={`flex flex-row align-middle justify-center items-center gap-x-4 p-2 sm:p-4 border-cardborder ${
        isCorrect && "bg-[#E6F7E6] border-[#34B634] text-white"
      } ${
        selected && !isCorrect && "bg-[#FDD2D2] border-[#FA4343] text-black"
      } border rounded-md`}
    >
      <div
        className={`inline-flex w-8 h-8 sm:w-12 sm:h-12 text-center justify-center items-center font-bold text-lg sm:text-xl border border-cardborder ${
          isCorrect && "bg-[#34B634]"
        } ${
          selected && !isCorrect && "bg-[#FA4343] text-white"
        } rounded-md capitalize`}
      >
        {answerChar}
      </div>
      <div className="inline-flex flex-1 w-full flex-row justify-between items-center gap-x-1">
        <p
          className="text-base text-black"
          dangerouslySetInnerHTML={{
            __html: formatTextForTest(answer.text.trim()),
          }}
        ></p>
        <p className="text-black font-semibold">
          {selected && isCorrect
            ? "+1.5" // Selected answer is correct
            : selected && !isCorrect
            ? "-0.4" // Selected answer is wrong
            : ""}
          {
            isBlank &&
              isCorrect &&
              "+0" /* If the answer was left blank, put "+0" in the correct answer */
          }
        </p>
      </div>
    </div>
  );
}

export function Answer({
  answer,
  selected,
  isCorrect = false,
  answerChar,
  isBlank,
}: {
  answerChar: string;
  answer: PrismaAnswer;
  selected: boolean;
  isCorrect: boolean;
  isBlank: boolean;
}) {
  const { review } = useReview();
  if (review) {
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
        className={`flex items-center flex-row p-2 sm:p-4 ${
          selected ? "bg-[#E0F2FF]" : "bg-[#F7F7F7]"
        } ${
          selected ? "border-primary" : "border-[#9D9D9D]"
        } border rounded-md`}
      >
        <div
          className={`inline-flex mr-4 w-8 min-w-8 h-8 sm:w-12 sm:min-w-12 sm:h-12 text-center justify-center items-center font-bold text-lg sm:text-xl ${
            selected ? "bg-primary text-white" : "bg-white text-black"
          } ${!selected && "border"} border-cardborder rounded-md capitalize`}
        >
          {answerChar}
        </div>
        <p
          className="inline text-base"
          dangerouslySetInnerHTML={{
            __html: formatTextForTest(answer.text.trim()),
          }}
        ></p>
      </div>
    </>
  );
}
