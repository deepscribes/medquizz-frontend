const features = [
  {
    name: "♾️ Illimitato",
    text: 'Preparati a un\'avventura senza fine con <span class="font-semibold">esercitazioni</span> e <span class="font-semibold">simulazioni</span> a volontà! Che tu voglia fare una maratona di studio o solo qualche rapido ripasso, qui non esaurirai mai le opzioni.',
  },
  {
    name: "✨ Personalizzazione",
    text: 'Sei tu il maestro del gioco! Scegli le domande come preferisci: <span class="font-bold">in ordine</span> o <span class="font-bold">a caso</span>. E no, non ti faremo ripetere le stesse cose, promesso. Creiamo insieme il tuo percorso personalizzato.',
  },
  {
    name: "🪄 Commenti",
    text: 'Ogni quesito viene spiegato con chiarezza dall\'<span class="font-bold">intelligenza artificiale</span>, garantendo che ogni dubbio venga risolto e ogni concetto chiarito!',
  },
];

export function Features() {
  return (
    <div className="w-full">
      <div
        id="features"
        className="flex flex-row flex-wrap justify-center content-center gap-16 items-center mx-auto"
      >
        {features.map((feature) => (
          <Feature key={feature.name} name={feature.name} text={feature.text} />
        ))}
      </div>
    </div>
  );
}

type FeatureProps = {
  name: string;
  text: string;
};

function Feature(props: FeatureProps) {
  return (
    <div className="flex flex-col items-start justify-between w-[300px] h-[210px]">
      <h3 className="text-2xl font-bold text-text-cta text-nowrap">
        {props.name}
      </h3>
      <p
        className="text-left mt-4 text-text-cta opacity-70"
        dangerouslySetInnerHTML={{
          __html: props.text,
        }}
      ></p>
      <a href="/seleziona" className="mt-3 text-text-lightblue">
        Inizia ora! ➡️
      </a>
    </div>
  );
}
