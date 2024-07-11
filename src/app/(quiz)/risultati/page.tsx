"use client";

import { Navbar } from "@/components/navbar";
import { Chart } from "chart.js/auto";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SearchParams = {
  subject: string;
  startTime: number;
  result: string;
  timeElapsed: number;
  excludePastQuestions: boolean;
};

type ResultsData = number[];

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const { subject, startTime, result, timeElapsed, excludePastQuestions } =
    searchParams;
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [resultsData, setResultsData] = useState<ResultsData>();
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem(
      "redirectUrl",
      `/risultati?subject=${subject}&startTime=${startTime}&result=${result}&timeElapsed=${timeElapsed}&excludePastQuestions=${excludePastQuestions}`
    );
    setQuestionCount(
      JSON.parse(localStorage.getItem("questions") || "[]").length || 0
    );
    // (async () => {
    //   await fetch("/api/telemetry");
    // })();
  }, [subject, startTime, result, timeElapsed, excludePastQuestions]);

  // Get general test results
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/testResults?type=" + subject);
      const data = await res.json();
      const percentages: number[] = data.map((k: any) => k.score / k.maxScore);
      // Group by percentage
      const groupedData = Array.from({ length: 100 }, () => 0);
      percentages.forEach((p) => {
        const percentage = Math.round(p * 100);
        groupedData[percentage] += 1;
      });
      setResultsData(groupedData);
    })();
  }, [subject]);

  // Save test result in database
  useEffect(() => {
    (async () => {
      const alreadySubmitted = localStorage.getItem("submitted");
      if (alreadySubmitted === "true") return;
      const questionCount = JSON.parse(
        localStorage.getItem("questions") || "[]"
      ).length;
      if (result == undefined || questionCount == undefined) {
        console.error("Missing score or count, can't save test result");
        alert("Errore: impossibile salvare il risultato del test");
        return;
      }

      // Load correct answers from localStorage or fetch them
      let allCorrectAnswers: number[] = JSON.parse(
        localStorage.getItem("correctAnswers") || "[]"
      );
      if (!allCorrectAnswers || !allCorrectAnswers.length) {
        const res = await fetch("/api/getCorrectAnswers");
        const data = await res.json();
        allCorrectAnswers = data;
      }

      const submittedAnswers = Object.keys(localStorage)
        .filter((k) => k.startsWith("question-"))
        .map((k) => parseInt(localStorage.getItem(k)!));

      const correctAnswers = submittedAnswers.filter((k) =>
        allCorrectAnswers.includes(k)
      );
      const wrongAnswers = submittedAnswers.filter(
        (k) => !correctAnswers.includes(k)
      );

      const res = await fetch("/api/userData/test", {
        method: "POST",
        body: JSON.stringify({
          type: subject,
          score: parseInt(result),
          maxScore: questionCount * 1.5,
          correctAnswers,
          wrongAnswers,
        }),
      });
      if (res.ok) {
        localStorage.setItem("submitted", "true");
      }
    })();
  }, [result, subject]);

  useEffect(() => {
    if (!resultsData) return;
    const ctx = document.getElementById("resultChart") as HTMLCanvasElement;
    // const myChart = new Chart(ctx, {
    //   type: "scatter",
    //   data: {
    //     labels: Array.from({ length: 100 }, (_, i) => i),
    //     datasets: [
    //       {
    //         label: "Punteggio (%)",
    //         backgroundColor: "rgba(75, 192, 192, 0.2)",
    //         borderColor: "rgba(75, 192, 192, 1)",
    //         borderWidth: 1,
    //         data:
    //           resultsData && resultsData.some((k) => k > 0)
    //             ? resultsData.map((k, i) => {
    //                 return {
    //                   x: i,
    //                   y: k,
    //                 };
    //               })
    //             : [],
    //       },
    //     ],
    //   },
    //   options: {
    //     scales: {
    //       x: {
    //         beginAtZero: true,
    //         min: 0,
    //         max: 100,
    //         title: {
    //           display: true,
    //           text: "Punteggio (%)",
    //         },
    //       },
    //       y: {
    //         beginAtZero: true,
    //         title: {
    //           display: true,
    //           text: "Numero di test",
    //         },
    //       },
    //     },
    //   },
    // });

    // return () => {
    //   myChart.destroy();
    // };
  }, [resultsData]);
  return (
    <>
      <Navbar isTesting={false} />
      <main>
        <div className="text-center my-6 max-w-4xl mx-auto px-8 sm:my-12 sm:max-w-lg">
          <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border border-cardborder">
            <h1 className="text-2xl font-medium my-6">
              Congratulazioni! Hai totalizzato <br />
              <span className="font-extrabold">
                {result || 0}/{questionCount * 1.5 || 0}
              </span>{" "}
              in{" "}
              <span className="font-extrabold">
                {timeElapsed ? Math.floor(timeElapsed / 60) : 0} min 🎉
              </span>
            </h1>
            <div className="mx-auto w-full px-2 text-red-400">
              {resultsData && Object.keys(resultsData).length ? (
                // <canvas
                //   id="resultChart"
                //   className="rounded-lg mx-auto aspect-video"
                // />
                <img
                  alt="DiCaprio in Il Grande Gatsby"
                  src="https://medquizz.s3.eu-south-1.amazonaws.com/Il-grande-Gatsby.webp"
                  className="rounded-lg mx-auto aspect-video w-3/4"
                ></img>
              ) : (
                <h1>Caricamento...</h1>
              )}
            </div>
            <p className="text-center py-8 w-3/4 mx-auto">
              Hai un&apos;idea o hai notato un problema? Parliamone su{" "}
              <a
                href="https://discord.gg/3th6M2Zrxg"
                className="underline"
                target="_blank"
              >
                {" "}
                Discord
              </a>
              . Grazie per il tuo contributo e in bocca al lupo per i tuoi
              studi!
            </p>
            <div className="flex flex-row justify-between p-2">
              <button
                className="text-[#999999] sm:text-xl"
                onClick={() => {
                  localStorage.setItem("isReview", "true");
                  router.push(
                    `/test?subject=${subject}&startTime=${Date.now()}&excludePastQuestions=${excludePastQuestions}&startTime=${startTime}`
                  );
                }}
              >
                Rivedi test
              </button>
              <Link
                className="text-[#37B0FE] sm:text-xl font-bold"
                href="/"
                onClick={() => localStorage.clear()}
              >
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
