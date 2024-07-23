"use client";

import { PremiumModal } from "@/components/Modal/exclusiveToPremium";
import { Navbar } from "@/components/navbar";
import { PlanFactoryWithProps } from "@/components/Plans";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ReviewType, useReview } from "@/hooks/useReview";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@clerk/nextjs";
import { Plan, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function isPlanEnough(user: User | null | undefined, requiredPlan: Plan) {
  if (!user) {
    return requiredPlan === Plan.BASIC;
  }
  if (user.plan === Plan.EXCLUSIVE) {
    return true;
  }
  if (user.plan === Plan.PRO) {
    return requiredPlan === Plan.PRO || requiredPlan === Plan.BASIC;
  }
  return user.plan === Plan.BASIC && requiredPlan === Plan.BASIC;
}

function beforeTestButtonClick(
  setReview: React.Dispatch<React.SetStateAction<ReviewType>>,
  user: User | null | undefined,
  requiredPlan: Plan,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Check that the user's plan is enough
  if (!isPlanEnough(user, requiredPlan)) {
    setShowModal(true);
    throw new Error("Piano non sufficiente");
  }
  localStorage.clear();
  setReview(ReviewType.False);
}

export default function Page() {
  const { userId } = useAuth();
  const user = useUser();
  const router = useRouter();
  const { setReview } = useReview();
  const [showModal, setShowModal] = useState<boolean>(false);
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

  useEffect(() => {
    sessionStorage.setItem("redirectUrl", "/seleziona");
  }, []);

  return (
    <>
      <Navbar isTesting={false} />
      <main className="text-center my-6 max-w-4xl mx-auto px-8">
        {showModal && <PremiumModal setShowModal={setShowModal} />}
        <h1 className="font-semibold text-2xl text-left text-text-cta">
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
                try {
                  beforeTestButtonClick(
                    setReview,
                    user,
                    Plan.BASIC,
                    setShowModal
                  );
                  router.push(
                    `/test?subject=${value.url}&startTime=${Date.now()}`
                  );
                } catch (e) {
                  console.log(e);
                }
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
        <h1 className="font-semibold text-2xl text-left text-text-cta">
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
                try {
                  beforeTestButtonClick(
                    setReview,
                    user,
                    Plan.PRO,
                    setShowModal
                  );
                  localStorage.setItem("subject", value.url);
                  router.push(`/seleziona/${value.url}`);
                } catch (e) {
                  console.log(e);
                }
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
        <h1 className="font-semibold text-2xl text-left text-text-cta">
          Extra
        </h1>
        <div className={`flex flex-col bg-[#F7F7F7] text-left ${user}`}>
          <div
            className={`flex flex-row p-6 border border-b-transparent border-cardborder items-center cursor-pointer hover:bg-background hover:border-[#37B0FE] rounded-t-2xl`}
            onClick={(e) => {
              try {
                beforeTestButtonClick(
                  setReview,
                  user,
                  Plan.EXCLUSIVE,
                  setShowModal
                );
                if (!userId) {
                  router.push("/sign-up");
                  return;
                } else {
                  router.push(`/test?subject=ripasso&startTime=${Date.now()}`);
                }
              } catch (e) {
                console.log(e);
              }
            }}
          >
            <img
              src={
                "https://medquizz.s3.eu-south-1.amazonaws.com/icons/warning.png"
              }
              alt={"Ripasso errori"}
              className="w-12 h-12 mr-4"
            />
            <p className="text-lg">{"Ripasso errori"}</p>
          </div>
          <div
            className={`flex flex-row p-6 border border-cardborder items-center cursor-pointer hover:bg-background hover:border-[#37B0FE] rounded-b-2xl`}
            onClick={(e) => {
              try {
                beforeTestButtonClick(
                  setReview,
                  user,
                  Plan.EXCLUSIVE,
                  setShowModal
                );
                router.push("/commenti");
              } catch (e) {
                console.log(e);
              }
            }}
          >
            <img
              src={
                "https://medquizz.s3.eu-south-1.amazonaws.com/icons/genius.png"
              }
              alt={"Ripasso errori"}
              className="w-12 h-12 mr-4"
            />
            <p className="text-lg">Quesiti commentati dall&apos;AI</p>
          </div>
        </div>
      </main>
      <Disclaimer />
    </>
  );
}
