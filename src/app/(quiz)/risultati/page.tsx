"use client";

import { Navbar } from "@/components/navbar";
import { Chart } from "chart.js/auto";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SearchParams = {
  r: number;
  t: number;
};

type ResultsData = {
  [key: number]: number;
};

function calculateMinutes(s: number, end: any) {
  return Math.floor((end - s) / 60000);
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const { r, t } = searchParams;
  const [start, setStart] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [resultsData, setResultsData] = useState<ResultsData>([]);
  const router = useRouter();
  useEffect(() => {
    setStart(parseInt(localStorage.getItem("start") || Date.now().toString()));
    setCount(JSON.parse(localStorage.getItem("questions") || "[]").length || 0);
  }, [router]);

  // Get general test results
  useEffect(() => {
    (async () => {
      const subject = localStorage.getItem("subject");
      if (!subject) return;
      const res = await fetch("/api/testResults?type=" + subject);
      const data = await res.json();
      setResultsData(data);
    })();
  }, []);

  // Save test result in database
  useEffect(() => {
    (async () => {
      const subject = localStorage.getItem("subject");
      const alreadySubmitted = localStorage.getItem("submitted");
      if (!subject || alreadySubmitted) return;
      if (!r || !count) {
        console.error("Missing score or count, can't save test result");
      }

      const res = await fetch("/api/userData/test", {
        method: "POST",
        body: JSON.stringify({
          type: subject,
          score: r,
          maxScore: count * 1.5,
        }),
      });
      if (res.ok) {
        localStorage.setItem("submitted", "true");
      }
    })();
  }, []);

  useEffect(() => {
    const ctx = document.getElementById("resultChart") as HTMLCanvasElement;
    if (!ctx) return;
    const data: { [key: number]: number } = {};
    // TODO Add actual data instead of random one
    for (let i = 0; i < 1000; i++) {
      const rn = Math.floor(Math.random() * 60);
      data[rn] = (data[rn] || 0) + 1;
    }
    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            data: Object.keys(data).map((k) => {
              return {
                x: k,
                y: data[parseInt(k)],
              };
            }),
            backgroundColor: ["#37B0FE", "#F3F4F6"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    return () => {
      myChart.destroy();
    };
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
                {r || 0}/{count * 1.5 || 0}
              </span>{" "}
              in{" "}
              <span className="font-extrabold">
                {start ? calculateMinutes(start, t) : 0} min 🎉
              </span>
            </h1>
            <div className="mx-auto w-full px-2">
              <canvas
                id="resultChart"
                className="rounded-lg mx-auto aspect-video"
              />
            </div>
            <p className="text-center py-8 sm:w-1/2 mx-auto">
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
                  router.push("/test");
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
