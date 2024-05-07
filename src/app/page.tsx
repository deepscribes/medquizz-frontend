"use client";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-3/4 flex-grow mx-auto">
        <div className="text-center mt-12 mb-8">
          <p className="font-semibold text-[#6EA6E1]">Test Medicina 2024</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold m-8 text-cta">
            Simulazioni Illimitate e Gratuite su{" "}
            <span className="text-nowrap">MedQuizz 🚀</span>
          </h1>
          <h2 className="text-xl max-w-md mx-auto text-cta">
            Esercitati GRATIS su tutti i quesiti della Banca Dati ufficiale{" "}
          </h2>
        </div>
        <div className="w-full flex items-center justify-center my-12">
          <a
            className="mx-auto text-xl font-semibold p-4 bg-primary text-white rounded-lg relative"
            href="/test"
            onClick={() => {
              localStorage.clear();
              localStorage.setItem("start", Date.now().toString());
            }}
          >
            👉 Esercitati GRATIS!
            <div className="w-full h-full bg-secondary rounded-lg absolute top-2 left-2 -z-10"></div>
          </a>
        </div>
        <img
          className="w-full max-w-4xl mx-auto mt-6 object-cover rounded-lg"
          src="https://medquizz.s3.eu-south-1.amazonaws.com/demo.webp"
          alt=""
        />
      </main>
      <p className="font-extrabold text-center bottom-0 p-16 text-cta">
        Sviluppato dal team di{" "}
        <a
          href="https://www.deepscribes.com"
          className="underline"
          target="_blank"
        >
          Deepscribes
        </a>
      </p>
    </>
  );
}
