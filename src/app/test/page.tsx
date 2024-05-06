"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/QuestionRender";
import { generateRandomQuestion } from "@/types/questions";

type SearchParams = {
  q?: string;
  s?: string;
};

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const time = "10m";

  return (
    <>
      <Navbar isTesting={true} />
      <main>
        <div className="text-center my-6 max-w-lg mx-auto">
          <p className="font-semibold my-8">
            ⏱️ Tempo rimanente: <span className="font-bold">{time}</span>
          </p>
          <QuestionRender
            question={generateRandomQuestion()}
            onAnswer={(answer) =>
              console.log(`Question answered with ${answer}`)
            }
            isReview={false}
            submittedKey={"b"}
          />
        </div>
      </main>
    </>
  );
}
