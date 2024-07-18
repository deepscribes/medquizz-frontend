"use client";
import { Footer } from "@/components/footer";
import { Section } from "@/components/home/section";
import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/Pricing";
import dynamic from "next/dynamic";
import { Features } from "@/components/home/Features";
import { FAQ } from "@/components/home/FAQ";
import { useEffect } from "react";

const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
  ssr: false,
});

export default function Home() {
  useEffect(() => {
    sessionStorage.setItem("redirectUrl", "/");
    localStorage.clear();
  }, []);
  return (
    <>
      <Navbar isHome={true} />
      <main className="flex-grow mx-auto">
        <div className="text-center mt-24 mb-8 w-3/4 mx-auto">
          <p className="font-semibold text-text-lightblue">
            Test Medicina 2024
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold !leading-tight m-8 text-text-cta">
            Domina il test di Luglio con{" "}
            <span className="text-nowrap">MedQuizz 🚀</span>
          </h1>
          <h2 className="text-xl max-w-md mx-auto text-[#1A2B4CB2]">
            I primi in Italia con i quesiti commentati!
          </h2>
        </div>
        <div className="w-full flex items-center justify-center mt-12">
          <a
            className="mx-auto text-xl font-semibold p-4 bg-primary text-white rounded-lg relative"
            href="/seleziona"
            onClick={() => {
              localStorage.clear();
              localStorage.setItem("start", Date.now().toString());
            }}
          >
            👉 Prova GRATIS!
            <div className="w-full h-full bg-secondary rounded-lg absolute top-2 left-2 -z-10"></div>
          </a>
        </div>
        <Section
          mainText="Dicono di noi 😎 "
          smallText="Testimonials"
          id="testimonials"
          className="w-[calc(100vw-32px)]"
        >
          <Testimonials />
        </Section>
        <Section
          mainText="Perchè MedQuizz? 🤔"
          smallText="Funzionalità"
          id="features"
        >
          <p className="text-text-cta opacity-70">
            Lavoriamo costantemente per{" "}
            <span className="font-bold">correggere errori e refusi</span> nella
            nostra banca dati, assicurando l&apos;eccellenza di ogni domanda
          </p>
          <img
            className="w-full max-w-4xl mx-auto mt-6 object-cover rounded-lg"
            src="https://medquizz.s3.eu-south-1.amazonaws.com/demo.webp"
            alt=""
          />
          <Features />
        </Section>
        <Section smallText="FAQ" mainText="Domande Frequenti 🤔" id="faq">
          <FAQ />
        </Section>
        <Section smallText="Pricing" mainText="Esplora i nostri Piani 💸">
          <Pricing />
        </Section>
      </main>
      <Footer />
    </>
  );
}
