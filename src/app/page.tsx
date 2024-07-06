"use client";
import { Footer } from "@/components/footer";
import { Section } from "@/components/home/section";
import { Testimonials } from "@/components/home/Testimonials";
import { Navbar } from "@/components/navbar";

const sections = [
  {
    text: {
      title: "Massima personalizzazione",
      description:
        "Dalle simulazioni complete, perfette per ricreare l'ambiente del test reale, alle sessioni rapide focalizzate su materie specifiche. Genera domande casuali o seleziona un intervallo preciso dalla banca dati.",
    },
    image: {
      url: "https://medquizz.s3.eu-south-1.amazonaws.com/1.webp",
    },
  },
  {
    text: {
      title: "Quesiti commentati",
      description:
        "Non perdere tempo a cercare le spiegazioni altrove. La nostra intelligenza artificiale fornisce risposte commentate direttamente sulla piattaforma. Facile e veloce!",
    },
    image: {
      url: "https://medquizz.s3.eu-south-1.amazonaws.com/2.webp",
    },
  },
];

export default function Home() {
  return (
    <>
      <Navbar isHome={true} />
      <main className="w-3/4 flex-grow mx-auto">
        <div className="text-center mt-24 mb-8">
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
        <Testimonials />
        <Section mainText="Perchè MedQuizz? 🤔" smallText="Funzionalità">
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
        </Section>
        {sections.map((section, index) => (
          <section
            key={index}
            className={`flex flex-col items-center justify-center my-48 ${
              index % 2 ? "sm:flex-row-reverse" : "sm:flex-row"
            }`}
          >
            <div className="w-full sm:w-1/2 flex flex-col items-center justify-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-cta">
                {section.text.title}
              </h2>
              <p className="text-text-cta max-w-md mx-auto mt-4">
                {section.text.description}
              </p>
            </div>
            <div className="w-full sm:w-1/2">
              <img
                className="w-full object-cover rounded-lg"
                src={section.image.url}
                alt=""
              />
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
