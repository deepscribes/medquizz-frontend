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

function redirectToTestResults(router: AppRouterInstance) {
  let questions: any = localStorage.getItem("questions");
  let correctAnswers;
  try {
    questions = JSON.parse(questions) as QuestionWithAnswers[];
    correctAnswers = questions.map(
      (q: QuestionWithAnswers) => q.answers.find((a) => a.isCorrect)?.id || 0
    );
  } catch (err) {
    console.error(
      "Error parsing questions, clearing localStorage and retrying",
      err
    );
    localStorage.clear();
    window.location.reload();
    return;
  }
  console.log("Successfully parsed questions", questions);
  const points = getPoints(
    correctAnswers,
    Object.keys(localStorage)
      .filter((k) => k.startsWith("question-"))
      .map((k) => parseInt(localStorage.getItem(k)!))
  );
  const startTime = parseInt(localStorage.getItem("startTime") || "0");
  const subject = localStorage.getItem("subject");
  const excludePastQuestions = localStorage.getItem("excludePastQuestions");
  router.push(
    `/risultati?subject=${subject}&startTime=${startTime}&result=${points}&excludePastQuestions=${excludePastQuestions}&timeElapsed=${Math.round(
      (Date.now() - startTime) / 1000
    )}`
  );
}

export function redirectAfterAuth(router: AppRouterInstance, options: Options) {
  const handleFallbackRedirect = (action?: "back" | "home") => {
    console.log("No redirect URL found, falling back to", action);
    if (action === "home") {
      console.log("Redirecting to home");
      router.push("/");
      return;
    }
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
  };

  if (localStorage.getItem("questions")) {
    console.log("Questions found, redirecting to test results");
    redirectToTestResults(router);
    return;
  }

  const redirectUrl = sessionStorage.getItem("redirectUrl") || null;
  if (redirectUrl) {
    console.log("Redirect URL found, redirecting to", redirectUrl);
    router.push(redirectUrl);
    return;
  }

  handleFallbackRedirect(options?.defaultRedirectAction);
}
