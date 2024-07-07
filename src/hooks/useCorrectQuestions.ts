import { useEffect, useState } from "react";

export function useCorrectQuestions() {
  const [correctQuestions, setCorrectQuestions] = useState<number[]>([]);

  useEffect(() => {
    // Load correct answers from localStorage or fetch them
    const answers = localStorage.getItem("correctAnswers");
    if (answers) {
      setCorrectQuestions(JSON.parse(answers));
    } else {
      fetch("/api/getCorrectAnswers")
        .then((res) => res.json())
        .then((data) => setCorrectQuestions(data));
    }
  }, []);

  return correctQuestions;
}
