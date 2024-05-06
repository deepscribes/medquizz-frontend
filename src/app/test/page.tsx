"use client";

import { Navbar } from "@/components/navbar";
import { QuestionRender } from "@/components/QuestionRender";
import { generateRandomQuestion } from "@/types/questions";

type SearchParams = {
  q?: string;
  s?: string;
};

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <Navbar />
      <main>
        <div className="text-center my-12 max-w-lg mx-auto">
          <QuestionRender
            question={generateRandomQuestion()}
            onAnswer={(answer) =>
              console.log(`Question answered with ${answer}`)
            }
          />
        </div>
      </main>
    </>
  );
}
