"use client";
import { GetCorrectAnswersAPIResponse } from "@/app/api/getCorrectAnswers/route";
import { APIResponse } from "@/types/APIResponses";
import {
  useContext,
  useEffect,
  useState,
  createContext,
  ReactNode,
} from "react";

export const CorrectAnswersContext = createContext<{
  answers: number[];
  setAnswers: React.Dispatch<React.SetStateAction<number[]>>;
}>({ answers: [], setAnswers: () => {} });

export const CorrectAnswersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [answers, setAnswers] = useState<number[]>([]);

  return (
    <CorrectAnswersContext.Provider value={{ answers, setAnswers }}>
      {children}
    </CorrectAnswersContext.Provider>
  );
};

export function useCorrectAnswers(): number[] {
  const { answers, setAnswers } = useContext(CorrectAnswersContext);

  useEffect(() => {
    if (answers.length === 0) {
      fetch("/api/getCorrectAnswers")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Errore nella richiesta");
          }
          return response.json();
        })
        .then((response: APIResponse<GetCorrectAnswersAPIResponse>) => {
          if (response.status === "error") {
            throw new Error("Errore nella richiesta");
          }
          setAnswers(response.data.correctAnswers);
        })
        .catch((e) => {
          console.error(e);
          setAnswers([]);
        });
    }
  }, [answers.length, setAnswers]);

  return answers;
}
