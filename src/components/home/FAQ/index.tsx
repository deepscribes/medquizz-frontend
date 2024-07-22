import { useState, isValidElement } from "react";

const FAQQuestions = [
  {
    question: "Dove posso trovare i quesiti commentati?",
    answer: (
      <>
        <p>Facile! È possibile avere i quesiti commentati in due modi:</p>
        <ul className="list-decimal ml-4">
          <li>
            Se vuoi consultarli in stile &quot;PDF&quot;, clicca su{" "}
            <span className="font-bold">Prova Gratis!</span> e scorri fino alla
            sezione <span className="font-bold">Extra</span> per accedere ai{" "}
            <a href="/commenti" className="font-bold">
              Quesiti commentati dall&apos;AI.
            </a>
          </li>
          <li>
            Dopo aver completato una simulazione, clicca per consegnare la
            prova. Guarda il riquadro a tendina in basso per trovare i commenti
            dell’AI.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "Posso esercitarmi su quesiti specifici?",
    answer: (
      <p>
        Certo che sì! Seleziona la materia che ti interessa e inserisci
        l’intervallo dei quesiti nel modulo in basso. Per esempio, se vuoi
        sfidarti con i quesiti da 1 a 10 di biologia, clicca su biologia e
        compila così il modulo: “Da 1 a 10 della banca dati MUR”.
      </p>
    ),
  },
  {
    question: "È possibile rivedere una vecchia simulazione?",
    answer:
      'Assolutamente! Per fare un tuffo nel passato delle tue prestazioni, vai sul tuo profilo e seleziona "Storico simulazioni". Troverai tutte le tue vecchie simulazioni, pronte per essere rivisitate quando vuoi.',
  },
];

type QuestionProps = {
  question: string;
  answer: React.JSX.Element | string;
  isFirst: boolean;
  isLast: boolean;
};

function Question(props: QuestionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`flex flex-col border border-cardborder border-b-transparent ${
        props.isFirst ? "rounded-t-xl" : ""
      } ${props.isLast ? "rounded-b-xl" : ""} ${
        isOpen ? "text-text-lightblue" : "text-text-cta"
      } ${!isOpen && props.isLast ? "!border-b-cardborder" : ""}`}
    >
      <div
        className="flex flex-row p-5 w-full justify-between items-center cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <p className="font-semibold ">{props.question}</p>
        <button
          aria-label="Apri/chiudi la risposta"
          className={` w-6 h-6 transition-all ${
            isOpen ? "rotate-180 fill-text-lightblue" : ""
          }`}
        >
          <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 330 330"
            xmlSpace="preserve"
          >
            <path
              id="XMLID_225_"
              d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
	c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
	s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
            />
          </svg>
        </button>
      </div>
      <div
        className={`text-text-extralight text-left border-transparent border-t-cardborder transition-all ${
          isOpen ? "h-full p-5 border" : "h-0 opacity-0 pointer-events-none"
        } ${props.isLast && isOpen ? "rounded-b-xl border-b-cardborder" : ""}`}
      >
        {isValidElement(props.answer) ? props.answer : <p>{props.answer}</p>}
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      {FAQQuestions.map((question, index) => (
        <Question
          key={index}
          isFirst={index === 0}
          isLast={index === FAQQuestions.length - 1}
          question={question.question}
          answer={question.answer}
        />
      ))}
    </div>
  );
}
