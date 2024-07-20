import { useUser } from "@/hooks/useUser";
import { useAuth } from "@clerk/nextjs";
import { Plan, User } from "@prisma/client";

type Piano = {
  emoji: string;
  title: string;
  text: string;
  price: string;
  recurrence: string;
  buttonText: string;
  buttonBackgroundColor: string;
  href: string;
  isOnSale?: boolean;
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
  href: "/seleziona",
  includes: [
    {
      text: "Simulazioni (completa, rapida)",
      isIncluded: true,
    },
    {
      text: "Storico simulazioni",
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
      text: "Quesiti commentati",
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
  isOnSale: true,
  href: "https://medquizz.lemonsqueezy.com/buy/91b1f1d7-70e4-43bd-8d3d-14105b9bfbfe",
  includes: [
    {
      text: "Simulazioni (completa, rapida)",
      isIncluded: true,
    },
    {
      text: "Storico simulazioni",
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
      text: "Quesiti commentati",
      isIncluded: false,
    },
  ],
};

const pianoPlus: Piano = {
  emoji: "🚀",
  title: "Exclusive",
  text: "Il piano definitivo per i veri campioni.",
  buttonText: "👉 Compra ORA!",
  buttonBackgroundColor: "#37B0FE",
  price: "$29",
  recurrence: "/una tantum",
  isOnSale: true,
  href: "https://medquizz.lemonsqueezy.com/buy/d0264f78-9fb6-4a42-856c-5cf5ed5b5eb5",
  includes: [
    {
      text: "Simulazioni (completa, rapida)",
      isIncluded: true,
    },
    {
      text: "Storico simulazioni",
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
      text: "Quesiti commentati",
      isIncluded: true,
    },
  ],
};

const pricingData: Piano[] = [pianoBase, pianoPro, pianoPlus];

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-row flex-wrap justify-center gap-8 sm:gap-x-16"
      id="pricing"
    >
      {children}
    </div>
  );
}

function TitleText({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-left">{title}</h2>
      <p className="text-md text-text-gray text-left">{text}</p>
    </div>
  );
}

function Features({
  features,
}: {
  features: { text: string; isIncluded: boolean }[];
}) {
  return (
    <ul className="mt-4 text-sm text-left">
      {features.map((feature) => (
        <li key={feature.text} className="flex items-center gap-x-4">
          <input
            aria-hidden
            type="checkbox"
            defaultChecked={feature.isIncluded}
            className="appearance-none flex-shrink-0 h-4 w-4 rounded-full bg-[#F7F7F7] border border-cardborder checked:border-primary checked:bg-primary"
          ></input>
          <p className="text-base font-[500]">{feature.text}</p>
        </li>
      ))}
    </ul>
  );
}

export function Pricing() {
  const { userId } = useAuth();
  const user = useUser();

  function isOfferBought(i: number) {
    if (!user) return false;
    if (i === 0) return false;
    if (i === 1) return user.plan === Plan.PRO || user.plan === Plan.EXCLUSIVE;
    if (i === 2) return user.plan === Plan.EXCLUSIVE;
  }

  function getHref(planHref: string, i: number) {
    if (i === 0) return planHref; // The basic option doesn't need special checks
    if (!userId || !user) return "/sign-up"; // If the user is not logged in, redirect to the sign-up page
    // Add the user id to the query string to pass it to the checkout page
    planHref = `${planHref}?checkout[custom][user_id]=${userId}`;
    if (isOfferBought(i)) return "/seleziona";
    return planHref;
  }

  return (
    <Wrapper>
      {pricingData.map((piano, i) => (
        <div
          key={piano.title}
          className="flex flex-col items-center justify-center w-full max-w-[300px]"
        >
          <div className="flex flex-row items-center justify-center w-full h-[180px] gap-x-3 p-4 bg-backgrounds-light rounded-t-lg border border-cardborder border-b-transparent">
            {piano.isOnSale ? (
              <div className="flex flex-col justify-start w-full max-w-[85px] h-full -mt-10">
                <img
                  src="https://medquizz.s3.eu-south-1.amazonaws.com/icons/on_sale.png"
                  aria-hidden
                  className="w-[85px] aspect-square"
                />
              </div>
            ) : (
              <span className="text-5xl">{piano.emoji}</span>
            )}
            <TitleText title={piano.title} text={piano.text} />
          </div>
          <div className="bg-white w-full border border-cardborder p-4 rounded-b-lg">
            <div className="flex flex-row items-baseline justify-start mt-4">
              <span className="text-5xl font-extrabold">{piano.price}</span>
              <span className="text-md font-semibold ml-2">
                {piano.recurrence}
              </span>
            </div>
            <a
              className={`block mx-auto w-full text-white font-bold rounded-xl my-8 p-4 active:filter active:brightness-90 transition-colors`}
              style={{
                backgroundColor: piano.buttonBackgroundColor,
              }}
              href={getHref(piano.href, i)}
            >
              {piano.buttonText}
            </a>
            <p className="w-full text-left text-backgrounds-gray uppercase font-semibold text-sm">
              Include
            </p>
            <Features features={piano.includes} />
          </div>
        </div>
      ))}
    </Wrapper>
  );
}
