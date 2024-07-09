import { useState } from "react";

const FAQQuestions = [
  {
    question: "Dove posso trovare i quesiti commentati?",
    answer:
      "Facile! Dopo aver completato una simulazione o un'esercitazione, clicca per consegnare la prova. Guarda in basso e troverai un riquadro viola a tendina. Cliccalo e... sorpresa! Troverai il commento dell’AI pronto per aiutarti a capire meglio le risposte.",
  },
  {
    question: "Posso esercitarmi su quesiti specifici?",
    answer:
      "Certo che sì! Seleziona la materia che ti interessa e inserisci l’intervallo dei quesiti che vuoi esercitare nel modulo in basso. Per esempio, se vuoi sfidarti con i quesiti da 1 a 10 di biologia, clicca su biologia e compila così il modulo: “Da 1 a 10 della banca dati MUR”.",
  },
  {
    question: "È possibile rivedere una vecchia simulazione?",
    answer:
      'Assolutamente! Per fare un tuffo nel passato delle tue prestazioni, vai sul tuo profilo e seleziona "Storico situazioni". Troverai tutte le tue vecchie simulazioni, pronte per essere rivisitate quando vuoi.',
  },
];

type QuestionProps = {
  question: string;
  answer: string;
  isFirst: boolean;
  isLast: boolean;
};

function Question(props: QuestionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`flex flex-col border border-cardborder border-b-transparent ${
        props.isFirst ? "rounded-t-xl" : ""
      } ${props.isLast ? "rounded-b-xl border-b-cardborder" : ""} ${
        isOpen ? "text-text-lightblue" : "text-text-cta"
      }`}
    >
      <div className="flex flex-row p-5 w-full justify-between items-center">
        <p className="font-semibold ">{props.question}</p>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
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
      <p
        className={`text-text-extralight text-left border-transparent border-t-cardborder transition-all ${
          isOpen ? "h-full p-5 border" : "h-0 opacity-0 pointer-events-none"
        }`}
      >
        {props.answer}
      </p>
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
