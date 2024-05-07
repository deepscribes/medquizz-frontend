"use client";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-3/4 flex-grow mx-auto">
        <div className="text-center my-12">
          <p className="uppercase font-semibold">TEST MEDICINA 2024</p>
          <h1 className="text-5xl font-extrabold m-8">
            🚀 Simulazioni Illimitate e gratuite su MedQuizz
          </h1>
          <h2 className="text-xl max-w-md mx-auto">
            Preparati con la banca ufficiale: siamo i primi in Italia!
          </h2>
        </div>
        <div className="w-full flex items-center justify-center my-24">
          <a
            className="mx-auto text-xl font-semibold p-4 bg-primary text-white rounded-lg relative"
            href="/test"
            onClick={() => {
              localStorage.clear();
              localStorage.setItem("start", Date.now().toString());
            }}
          >
            👉 Esercitati gratis!
            <div className="w-full h-full bg-secondary rounded-lg absolute top-2 left-2 -z-10"></div>
          </a>
        </div>
        <div className="bg-gray-500 max-w-xl h-60 mx-auto my-12 flex items-center justify-center">
          <p className="text-center text-white">Screen del simulatore</p>
        </div>
      </main>
      <p className="font-extrabold text-center bottom-0 p-8">
        Made with ❤ by Giuseppe and Nicola
      </p>
    </>
  );
}
