import { QuestionWithAnswers } from "./questions";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Options = {
  defaultRedirectAction?: "back" | "home";
};

function getPoints(correctAnswers: number[], answers: number[]) {
  let res = 0;
  for (const answer of answers) {
    if (correctAnswers.includes(answer)) {
      res += 1.5;
    } else {
      res -= 0.4;
    }
  }
  return Math.round(res * 100) / 100;
}
export function redirectAfterAuth(router: AppRouterInstance, options: Options) {
  // Helper function to get redirect URL from sessionStorage
  const getRedirectUrl = () => {
    const redirectUrl = sessionStorage.getItem("redirectUrl");
    if (redirectUrl) {
      sessionStorage.removeItem("redirectUrl");
      return redirectUrl;
    }
    return null;
  };

  // Helper function to handle test results redirection
  const handleTestResultsRedirect = () => {
    let questions: any = localStorage.getItem("questions");
    if (questions) {
      questions = JSON.parse(questions) as QuestionWithAnswers[];
      const correctAnswers = questions.map(
        (q: QuestionWithAnswers) => q.answers.find((a) => a.isCorrect)?.id || 0
      );
      const points = getPoints(
        correctAnswers,
        Object.keys(localStorage)
          .filter((k) => k.startsWith("question-"))
          .map((k) => parseInt(localStorage.getItem(k)!))
      );
      if (!localStorage.getItem("end")) {
        localStorage.setItem("end", Date.now().toString());
      }
      const end = parseInt(
        localStorage.getItem("end") || Date.now().toString()
      );
      router.push(
        `/risultati?result=${points}&timeElapsed=${Math.round(
          (Date.now() - end) / 1000
        )}`
      );
      return true;
    }
    return false;
  };

  // Helper function to handle fallback redirection
  const handleFallbackRedirect = (action?: "back" | "home") => {
    if (action === "back") {
      const referrer = document.referrer;
      const lastRedirect = sessionStorage.getItem("lastRedirect");
      if (lastRedirect && Date.now() - parseInt(lastRedirect) < 1000) {
        console.log("Preventing going back twice");
        return;
      }
      if (referrer.includes("medquizz") || referrer.includes("localhost")) {
        console.log("Redirecting back");
        sessionStorage.setItem("lastRedirect", Date.now().toString());
        router.back();
        return;
      }
    }
    router.push("/");
  };

  // Main redirection logic
  const redirectUrl = getRedirectUrl();
  if (redirectUrl) {
    router.push(redirectUrl);
    return;
  }

  if (handleTestResultsRedirect()) {
    return;
  }

  handleFallbackRedirect(options?.defaultRedirectAction);
}
