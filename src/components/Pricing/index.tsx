import { Section } from "../home/section";

type Piano = {
  emoji: string;
  title: string;
  text: string;
  price: string;
  recurrence: string;
  buttonText: string;
  buttonBackgroundColor: string;
  includes: { text: string; isIncluded: boolean }[];
};

const pianoBase: Piano = {
  emoji: "👋",
  title: "Basic",
  text: "L'essenziale per cominciare a studiare in modo efficace e senza costi.",
  price: "$0",
  recurrence: "/gratis",
  buttonText: "Prova ora",
  buttonBackgroundColor: "#94A3B8",
  includes: [
    {
      text: "Simulazioni (completa, rapida)",
      isIncluded: true,
    },
    {
      text: "Statistiche",
      isIncluded: true,
    },
    {
      text: "Esercitazioni personalizzabili",
      isIncluded: false,
    },
    {
      text: "Ripasso errori",
      isIncluded: false,
    },
    {
      text: "Quesiti commentati AI",
      isIncluded: false,
    },
  ],
};

const pianoPro: Piano = {
  emoji: "🔥",
  title: "Pro",
  text: "Ideale per chi vuole un'esperienza completa senza compromessi.",
  buttonText: "Compra ora",
  buttonBackgroundColor: "#94A3B8",
  price: "$24",
  recurrence: "/una tantum",
  includes: [
    {
      text: "Simulazioni (completa, rapida)",
      isIncluded: true,
    },
    {
      text: "Statistiche",
      isIncluded: true,
    },
    {
      text: "Esercitazioni personalizzabili",
      isIncluded: true,
    },
    {
      text: "Ripasso errori",
      isIncluded: false,
    },
    {
      text: "Quesiti commentati AI",
      isIncluded: false,
    },
  ],
};

const pianoPlus = {
  emoji: "🚀",
  title: "Exclusive",
  text: "Il piano definitivo per i veri campioni.",
  buttonText: "👉 Compra ORA!",
  buttonBackgroundColor: "#37B0FE",
  price: "$29",
  recurrence: "/una tantum",
  includes: [
    {
      text: "Simulazioni (completa, rapida)",
      isIncluded: true,
    },
    {
      text: "Statistiche",
      isIncluded: true,
    },
    {
      text: "Esercitazioni personalizzabili",
      isIncluded: true,
    },
    {
      text: "Ripasso errori",
      isIncluded: true,
    },
    {
      text: "Quesiti commentati AI",
      isIncluded: true,
    },
  ],
};

const pricingData: Piano[] = [pianoBase, pianoPro, pianoPlus];

export function Pricing() {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-8 sm:gap-x-16">
      {pricingData.map((piano) => (
        <div
          key={piano.title}
          className="flex flex-col items-center justify-center w-full max-w-[300px]"
        >
          <div className="flex flex-row items-center justify-center w-full h-[180px] gap-x-3 p-4 bg-backgrounds-light rounded-t-lg border border-cardborder border-b-transparent">
            <span className="text-5xl">{piano.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-left">{piano.title}</h2>
              <p className="text-md text-text-gray text-left">{piano.text}</p>
            </div>
          </div>
          <div className="bg-white w-full border border-cardborder p-4 rounded-b-lg">
            <div className="flex flex-row items-baseline justify-start mt-4">
              <span className="text-5xl font-extrabold">{piano.price}</span>
              <span className="text-md font-semibold ml-2">
                {piano.recurrence}
              </span>
            </div>
            <button
              className={`mx-auto w-full text-white font-bold rounded-xl my-8 p-4 active:filter active:brightness-90 transition-colors`}
              style={{
                backgroundColor: piano.buttonBackgroundColor,
              }}
            >
              {piano.buttonText}
            </button>
            <p className="w-full text-left text-backgrounds-gray uppercase font-semibold text-sm">
              Include
            </p>
            <ul className="mt-4 text-sm text-left">
              {piano.includes.map((include) => (
                <li key={include.text} className="flex items-center gap-x-4">
                  <input
                    type="checkbox"
                    defaultChecked={include.isIncluded}
                    className="appearance-none flex-shrink-0 h-4 w-4 rounded-full bg-[#F7F7F7] border border-cardborder checked:border-primary checked:bg-primary"
                  ></input>
                  <p className="text-base font-[500]">{include.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
