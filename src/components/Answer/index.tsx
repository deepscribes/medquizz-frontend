import type { Answer as PrismaAnswer } from "@prisma/client";
import { insertImageInText } from "@/lib";

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
      className={`flex flex-row gap-x-4 items-center p-2 sm:p-4 border-cardborder ${
        isCorrect && "bg-[#E6F7E6] border-[#34B634] text-white"
      } ${
        selected && !isCorrect && "bg-[#FDD2D2] border-[#FA4343] text-black"
      } border rounded-md`}
    >
      <div
        className={`flex w-8 h-8 sm:w-12 text-center justify-center items-center font-bold text-lg sm:text-xl border border-cardborder ${
          isCorrect && "bg-[#34B634]"
        } ${
          selected && !isCorrect && "bg-[#FA4343] text-white"
        } rounded-md capitalize`}
      >
        {answerChar}
      </div>
      <p
        className="flex-shrink-[3] text-black"
        dangerouslySetInnerHTML={{ __html: insertImageInText(answer.text) }}
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

export function Answer({
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
        className={`flex flex-row gap-x-4 items-center p-2 sm:p-4 ${
          selected ? "bg-[#E0F2FF]" : "bg-[#F7F7F7]"
        } ${
          selected ? "border-primary" : "border-[#9D9D9D]"
        } border rounded-md`}
      >
        <div
          className={`flex flex-grow w-8 h-8 sm:w-12 sm:h-12 text-center justify-center items-center font-bold text-lg sm:text-xl ${
            selected ? "bg-primary text-white" : "bg-white text-black"
          } ${!selected && "border"} border-cardborder rounded-md capitalize`}
        >
          {answerChar}
        </div>
        <p
          className="flex-shrink-[3] text-base"
          dangerouslySetInnerHTML={{ __html: answer.text }}
        ></p>
      </div>
    </>
  );
}
