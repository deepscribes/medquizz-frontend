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

export function redirectAfterAuth(
  router: AppRouterInstance,
  options?: Options
) {
  // Try to get the redirect URL from sessionStorage
  const redirectUrl = sessionStorage.getItem("redirectUrl");
  if (redirectUrl) {
    router.push(redirectUrl);
    return;
  }

  let questions: any = localStorage.getItem("questions");

  if (questions) {
    questions = JSON.parse(questions) as QuestionWithAnswers[];
    // Redirect to test results
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
      console.warn("end not set, setting it now");
      localStorage.setItem("end", Date.now().toString());
    }
    const end = parseInt(localStorage.getItem("end")!);
    console.log("Redirecting to results");
    router.push(
      `/risultati?result=${points}&timeElapsed=${Math.round(
        (Date.now() - end) / 1000
      )}`
    );
    return;
  }

  // Fallback
  if (options?.defaultRedirectAction === "back") {
    // Check that the last page is a medquizz page. If it is, go back, otherwise go to home as a fallback
    const referrer = document.referrer;
    const lastRedirect = sessionStorage.getItem("lastRedirect");
    if (lastRedirect && Date.now() - parseInt(lastRedirect) < 1000) {
      console.log("Last redirect was less than 1s ago, not doing anything.");
      return;
    }
    if (referrer.includes("medquizz") || referrer.includes("localhost")) {
      console.log("Going back since fallback action is 'back'");
      sessionStorage.setItem("lastRedirect", Date.now().toString());
      window.history.back();
      return;
    }
    console.log("Going to home because the past page is not a medquizz page");
    router.push("/");
    return;
  } else {
    console.log("Going to home because fallback is not 'back'");
    router.push("/");
  }
}
