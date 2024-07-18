import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

function msToHMS(ms: number) {
  // 1- Convert to seconds:
  var seconds = Math.abs(ms) / 1000;
  // 2- Extract hours:
  var hours = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  var minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = Math.floor(seconds % 60);
  return `${ms < 0 ? "-" : ""}${(hours * 60 + minutes)
    .toString()
    .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
}

export function Timer({
  startTime,
  isReady,
  questions,
}: {
  startTime: number;
  isReady: boolean;
  questions: number;
}) {
  const testTime = ((100 * 60 * 1000) / 60) * questions; // 100 minutes for 60 questions
  const [timeElapsed, setTimeElapsed] = useState(0);
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || "";
  useEffect(() => {
    if (!isReady) return; // Don't start the timer if the test hasn't started
    function updateTime() {
      setTimeElapsed(Date.now() - startTime);
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isReady, startTime]);
  return (
    <p className="my-8">
      ⏱️{" "}
      {["rapido", "completo"].includes(subject) ? "Tempo rimanente" : "Tempo"}{" "}
      <span className="font-bold text-lg sm:text-xl">
        {msToHMS(
          ["rapido", "completo"].includes(subject)
            ? testTime - timeElapsed
            : timeElapsed
        )}
      </span>
    </p>
  );
}
