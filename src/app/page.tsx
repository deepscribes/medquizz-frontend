"use client";
import { Footer } from "@/components/footer";
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
        <div className="text-center mt-12 mb-8">
          <p className="font-semibold text-text-lightblue">
            Test Medicina 2024
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold m-8 text-text-cta">
            Simulazioni Illimitate e Gratuite su{" "}
            <span className="text-nowrap">MedQuizz 🚀</span>
          </h1>
          <h2 className="text-xl max-w-md mx-auto text-text-cta">
            Esercitati GRATIS su tutti i quesiti della Banca Dati ufficiale
          </h2>
        </div>
        <div className="w-full flex items-center justify-center my-12">
          <a
            className="mx-auto text-xl font-semibold p-4 bg-primary text-white rounded-lg relative"
            href="/seleziona"
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
        <section className="text-center mt-16">
          <small className="text-text-lightblue font-semibold text-lg">
            Funzionalità
          </small>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 mt-2 text-text-cta">
            Perchè MedQuizz? 🤔
          </h1>
          <p className="text-text-cta">
            Perché offriamo tutto questo GRATUITAMENTE senza compromessi sulla
            qualità. Ci impegniamo costantemente a correggere errori e refusi
            nella nostra banca dati, garantendo così l’eccellenza delle domande.
          </p>
        </section>
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
