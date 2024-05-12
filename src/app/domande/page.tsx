"use client";

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";

export default function Page() {
  const [number, setNumber] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  useEffect(() => {
    setTo(from + number);
  }, [number, from]);

  return (
    <>
      <Navbar isTesting={false} />
      <div className="flex flex-col items-center gap-y-2 bg-white max-w-2xl w-full mx-auto my-12 p-16 rounded-xl border-cardborder border">
        <label
          className="block text-lg font-semibold text-center"
          htmlFor="number"
        >
          Numero di domande: {number}
        </label>
        <input
          type="range"
          min={0}
          max={60}
          step={1}
          value={number}
          onChange={(e) => setNumber(parseInt(e.target.value))}
          name="number"
          id="number"
          className="w-full mt-4"
        />
        <div className="flex flex-row justify-between w-full text-cardborder">
          <p className="flex-grow">0</p>
          <p>60</p>
        </div>

        <p className="text-gray-700 my-14">OPPURE</p>

        <div className="flex flex-row gap-x-4 items-center font-semibold">
          <span>Da</span>
          <input
            className="text-center min-w-12 max-w-16 h-8 bg-[#F7F7F7] border-cardborder border rounded"
            type="number"
            min={0}
            max={60}
            value={from}
            onChange={(e) => setFrom(parseInt(e.target.value))}
          />
          <span>a</span>
          <input
            className="text-center min-w-12 max-w-16 h-8 bg-[#F7F7F7] border-cardborder border rounded"
            type="number"
            min={0}
            max={60}
            value={to}
            onChange={(e) => setTo(parseInt(e.target.value))}
          />
          <span>della banca ufficiale MUR</span>
        </div>
        <a
          href="/test"
          className="my-12"
          onClick={() => {
            // TODO: Handle from and to
            localStorage.setItem("questionCount", number.toString());
          }}
        >
          <div className="w-full flex items-center justify-center relative group">
            <p className="mx-auto font-semibold p-3 sm:px-8 bg-primary text-white rounded-lg relative z-20 group-active:bg-primary-pressed">
              👉 Genera QUIZ!
            </p>
            <div className="w-full h-full bg-secondary rounded-lg absolute top-1 left-1 z-10 group-active:bg-green-700"></div>
          </div>
        </a>
      </div>
    </>
  );
}
