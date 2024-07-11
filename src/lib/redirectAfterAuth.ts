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

  const questions: QuestionWithAnswers[] = JSON.parse(
    localStorage.getItem("questions") || ""
  );

  if (questions) {
    // Redirect to test results
    const correctAnswers = questions.map(
      (q) => q.answers.find((a) => a.isCorrect)?.id || 0
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
    console.log("Redirecting to results");
    router.push(`/risultati?r=${points}&t=${localStorage.getItem("end")}`);
    return;
  }

  // Fallback
  if (options?.defaultRedirectAction === "back") {
    // Check that the last page is a medquizz page. If it is, go back, otherwise go to home as a fallback
    const referrer = document.referrer;
    if (referrer.includes("medquizz") || referrer.includes("localhost")) {
      console.log("Going back since fallback action is 'back'");
      router.back();
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
