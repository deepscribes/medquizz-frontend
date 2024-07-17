"use client";
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
        .then((response) => response.json())
        .then((data) => setAnswers(data));
    }
  }, [answers.length, setAnswers]);

  return answers;
}
