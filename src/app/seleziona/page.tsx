"use client";

import { Navbar } from "@/components/navbar";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const simulazione = [
    {
      text: "Simulazione ufficiale (60 domande)",
      image: "https://medquizz.s3.eu-south-1.amazonaws.com/icons/education.png",
      url: "completo",
    },
    {
      text: "Simulazione rapida (30 domande)",
      image: "https://medquizz.s3.eu-south-1.amazonaws.com/icons/lightning.png",
      url: "rapido",
    },
  ];

  const materie = [
    {
      text: "Fisica e matematica",
      image:
        "https://medquizz.s3.eu-south-1.amazonaws.com/icons/blackboard.png",
      url: "fisica",
    },
    {
      text: "Biologia",
      image: "https://medquizz.s3.eu-south-1.amazonaws.com/icons/bacteria.png",
      url: "biologia",
    },
    {
      text: "Chimica",
      image:
        "https://medquizz.s3.eu-south-1.amazonaws.com/icons/periodic-table.png",
      url: "chimica",
    },
    {
      text: "Competenze di lettura e conoscenze acquisite negli studi",
      image: "https://medquizz.s3.eu-south-1.amazonaws.com/icons/book.png",
      url: "lettura",
    },
    {
      text: "Logica",
      image: "https://medquizz.s3.eu-south-1.amazonaws.com/icons/brain.png",
      url: "logica",
    },
  ];

  return (
    <>
      <Navbar isTesting={false} />
      <main>
        <div className="text-center my-6 max-w-4xl mx-auto px-8">
          <h1 className="font-semibold text-2xl text-left mb-6 mt-12 text-cta">
            Simulazione
          </h1>
          <div className="flex flex-col bg-[#F7F7F7] text-left">
            {Object.values(simulazione).map((value, i) => (
              <div
                key={i}
                className={`flex flex-row p-6 border border-cardborder items-center cursor-pointer hover:bg-background hover:border-[#37B0FE] ${
                  i ? "rounded-b-2xl" : "rounded-t-2xl"
                }`}
                onClick={() => router.push(`/test?subject=${value.url}`)}
              >
                <img
                  src={value.image}
                  alt={value.text}
                  className="w-12 h-12 mr-4"
                />
                <p className="text-lg">{value.text}</p>
              </div>
            ))}
          </div>
          <h1 className="font-semibold text-2xl text-left mb-6 mt-12 text-cta">
            Esercitazione per materia:{" "}
          </h1>
          <div className="flex flex-col bg-[#F7F7F7] text-left">
            {Object.values(materie).map((value, i, arr) => (
              <div
                key={i}
                className={`flex flex-row p-6 border border-cardborder items-center hover:bg-background hover:border-[#37B0FE] ${
                  i == arr.length - 1 ? "rounded-b-2xl" : ""
                } ${i == 0 ? "rounded-t-2xl" : ""}`}
                onClick={() => {
                  localStorage.clear();
                  router.push(`/test?subject=${value.url}`);
                }}
              >
                <img
                  src={value.image}
                  alt={value.text}
                  className="w-12 h-12 mr-4"
                />
                <p className="text-lg">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
