"use client";

import { Footer } from "@/components/footer";
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
      <main className="text-center my-6 max-w-4xl mx-auto px-8">
        <h1 className="font-semibold text-2xl text-left mb-6 mt-12 text-text-cta">
          Simulazione
        </h1>
        <div className="flex flex-col bg-[#F7F7F7] text-left">
          {Object.values(simulazione).map((value, i) => (
            <div
              key={i}
              className={`flex flex-row p-6 border border-cardborder items-center cursor-pointer hover:bg-background hover:border-[#37B0FE] ${
                i ? "rounded-b-2xl" : "rounded-t-2xl"
              }`}
              onClick={() => {
                router.push(
                  `/test?subject=${value.url}&startTime=${Date.now()}`
                );
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
        <h1 className="font-semibold text-2xl text-left mb-6 mt-12 text-text-cta">
          Esercitazione per materia
        </h1>
        <div className="flex flex-col bg-[#F7F7F7] text-left">
          {Object.values(materie).map((value, i, arr) => (
            <div
              key={i}
              className={`flex flex-row p-6 border border-cardborder items-center cursor-pointer hover:bg-background hover:border-[#37B0FE] ${
                i == arr.length - 1 ? "rounded-b-2xl" : ""
              } ${i == 0 ? "rounded-t-2xl" : ""}`}
              onClick={() => {
                localStorage.clear();
                localStorage.setItem("subject", value.url);
                router.push(`/seleziona/${value.url}`);
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
        <h1 className="font-semibold text-2xl text-left mb-6 mt-12 text-text-cta">
          Extra
        </h1>
        <div className="flex flex-col bg-[#F7F7F7] text-left">
          <div
            className={`flex flex-row p-6 border border-cardborder items-center cursor-pointer hover:bg-background hover:border-[#37B0FE] rounded-2xl`}
            onClick={() => {
              router.push(`/test?subject=ripasso&startTime=${Date.now()}`);
            }}
          >
            <img
              src={
                "https://s3-alpha-sig.figma.com/img/b261/8a3f/b73a64e3f39418ce3976ff7de145e66a?Expires=1721001600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=I7vKOQuFuZWbeEhsaRmXHVGARA3swt05mljY8bLs4iDx9LN28Kd16TbfIy6eb2UmIZhHk~wR22Df2-qiAmt4Qoa1pQco8ThdAT1tdW1O0tMP-KuxVJkGov~6cLWgX8mpB3Css09po6o-CL7VQ3rwsxDamSxVhtJKAEteVXtduagLt3~ursgRbzi~CyhAsvIQAqpGI6MAIS1l2iVrIUCNiZmwfSSAeu-M7HpXTWi4~qkqvTMchVZswx3LCT~AMMndllkpjGaT4qKAXLpuSa6ls9dlXZatOBFYiSj27S6eHdGqgI2El4n9FQd7sfF7aWz1zyRqhGCWFYJ9OILxiNk~9A__"
              }
              alt={"Ripasso errori"}
              className="w-12 h-12 mr-4"
            />
            <p className="text-lg">{"Ripasso errori"}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
