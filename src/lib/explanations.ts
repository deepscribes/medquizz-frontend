import client from "@/../prisma/db";
import { Answer, Question } from "@prisma/client";
import OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
} from "openai/resources/index.mjs";

export async function isExplanationInDB(explanationId: number) {
  return !!(await client.explanation.findUnique({
    where: { questionId: explanationId },
  }));
}

function markdownBoldToHTML(input: string) {
  return input.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

const systemMessages = [
  {
    role: "system",
    content: [
      {
        type: "text",
        text: "Agirai come uno professore delle superiori che sta spiegando alcuni quesiti del test di medicina ai propri studenti. Quando ti fornirò un quesito e la relativa risposta, dovrai fornire una spiegazione concisa e chiara del motivo per cui quella è la risposta esatta del quesito.\n\nEcco il quesito:\n<quesito>\n{{QUESITO}}\n</quesito>\n\nEcco la risposta al quesito:\n<risposta>\n{{RISPOSTA}}\n</risposta>\n\nSe viene specificato un brano, eccolo qui:\n<brano>\n{{BRANO}}\n</brano>\n\nSe è presente un brano, cerca la risposta all'interno di esso citando esattamente i passi del brano. Sii sempre conciso e chiaro nella tua spiegazione.\n\nTutti i calcoli matematici e le formule chimiche devono OBBLIGATORIAMENTE essere restituiti in formato LaTeX.\n\nFornisci la tua spiegazione chiara e concisa all'interno dei tag <spiegazione>.",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>\nLa secrezione del glucagone è regolata da\n</quesito> \n<risposta>\nlivelli di glucosio ematico\n</risposta>\n",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "<spiegazione>\nIl glucagone è un ormone iperglicemizzante prodotto dalle cellule endocrine presenti nel pancreas. La sua secrezione è regolata dal tasso di glucosio ematico e la sua principale funzione è di aumentare i livelli di glucosio nel sangue, favorendo la demolizione del glicogeno e la trasformazione degli amminoacidi in glucosio.\n</spiegazione>",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>\nQuale delle seguenti formule di struttura condensate è corretta per il 2-bromo-3-clorobutano?\n</quesito>\n<risposta>\nCH3-CHBr-CHCl-CH3\n</risposta>",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: '<spiegazione>\nIl 2-bromo-3-clorobutano è un composto organico con una catena di quattro atomi di carbonio (butano) e due sostituenti alogenati: un atomo di bromo e un atomo di cloro. La numerazione della catena carboniosa deve essere fatta in modo da assegnare i numeri più bassi possibili ai sostituenti.\n\n- Il "2-bromo" indica che il bromo è attaccato al secondo atomo di carbonio.\n- Il "3-cloro" indica che il cloro è attaccato al terzo atomo di carbonio.\n\nLa formula di struttura condensata corretta per il 2-bromo-3-clorobutano è quindi:\n\n\\[ \\text{CH}_3-\\text{CHBr}-\\text{CHCl}-\\text{CH}_3 \\]\n\nIn questa formula:\n- Il primo gruppo \\(\\text{CH}_3\\) rappresenta il primo atomo di carbonio con tre atomi di idrogeno.\n- Il secondo gruppo \\(\\text{CHBr}\\) rappresenta il secondo atomo di carbonio con un atomo di bromo e un atomo di idrogeno.\n- Il terzo gruppo \\(\\text{CHCl}\\) rappresenta il terzo atomo di carbonio con un atomo di cloro e un atomo di idrogeno.\n- Il quarto gruppo \\(\\text{CH}_3\\) rappresenta il quarto atomo di carbonio con tre atomi di idrogeno.\n\nQuindi, la risposta corretta è \\(\\text{CH}_3-\\text{CHBr}-\\text{CHCl}-\\text{CH}_3\\).\n</spiegazione>',
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>\nUna pallina da 200 g rotola su una superficie con attrito trascurabile alla\nvelocità di 2,3 m/s. Qual è la sua quantità di moto?\n</quesito>\n<risposta>\n 0,46 kg · m/s\n</risposta>",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "<spiegazione>\nLa quantità di moto (o momento lineare) di un oggetto è data dal prodotto della sua massa (\\( m \\)) per la sua velocità (\\( v \\)). La formula per calcolare la quantità di moto (\\( p \\)) è:\n\n\\[ p = m \\cdot v \\]\n\nIn questo caso, la massa della pallina è di 200 g. Prima di utilizzare la formula, dobbiamo convertire la massa in chilogrammi, poiché l'unità di misura standard nel Sistema Internazionale (SI) è il chilogrammo (kg).\n\n\\[ 200 \\, \\text{g} = 0{,}200 \\, \\text{kg} \\]\n\nLa velocità della pallina è di 2{,}3 m/s. Ora possiamo calcolare la quantità di moto:\n\n\\[ p = 0{,}200 \\, \\text{kg} \\cdot 2{,}3 \\, \\text{m/s} = 0{,}46 \\, \\text{kg} \\cdot \\text{m/s} \\]\n\nQuindi, la quantità di moto della pallina è \\( 0{,}46 \\, \\text{kg} \\cdot \\text{m/s} \\).\n</spiegazione>",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>\nQuali sono le principali sfide affrontate da Terzani durante il suo\nsoggiorno in Cina?\n</quesito>\n<risposta>\nLa censura governativa e la sorveglianza costante\n</risposta>\n\n<brano>\nNei primi anni '60 il giovane Terzani, appena laureato alla Normale di Pisa, iniziò a lavorare per\nl’Olivetti, dove rimase per cinque\nanni come manager. [...] Dopo un soggiorno americano, grazie a una prestigiosa borsa di studio,\ntornò in Italia con le idee chiare: la vita del manager gli stava stretta, voleva fare il giornalista,\nvedere il mondo con i suoi occhi e raccontarlo.\nLasciò il lavoro all’Olivetti e iniziò a collaborare con Il Giorno. Non riuscì però a convincere la\ndirezione del quotidiano milanese a mandarlo come inviato in Oriente. Riuscì allora a trovare\nlavoro come freelance nel Sud-est asiatico con la rivista tedesca Der Spiegel, e la sua vita cambiò.\nRealizzò reportage in Cambogia e in Vietnam, [...] scrivendo diari di guerra con uno stile letterario\nalto ed essenziale. Agli articoli si aggiunsero i libri, le collaborazioni con le principali testate italiane\ne internazionali, per poi raggiungere, all’alba degli anni Ottanta, il sogno di trasferirsi in Cina. Erano\ngli anni del post-Mao, Time e Newsweek premevano per diventare i primi magazine occidentali ad\navere corrispondenti in Cina, ma alla fine il primo giornalista a varcare quei confini fu proprio\nTerzani.\nTerzani vide un Paese snaturato, si accorse del fallimento del progetto maoista, soffrì per i templi\ntrasformati in fabbriche e per il crollo di quella magia che si era sempre aspettato, e che non aveva\ntrovato. Le autorità cinesi iniziarono a infastidirsi per i suoi scritti, che criticavano il governo, e\niniziarono a pressarlo. Inizialmente gli assegnarono un cuoco e un autista, ma Terzani si accorse\nche erano spie mandate per sorvegliarlo. E quando poi riuscì a entrare in Tibet, per incontrare il\nDalai Lama al Potala, il suo nome finì nella lista dei nemici della Cina. Nel 1984 venne arrestato\ncon l’accusa di attività controrivoluzionaria, in quanto personaggio scomodo, e fu espulso dal\nPaese.\nRaccontò la dissoluzione dell’Urss, la fine del sogno sovietico e le sue conseguenze. I suoi scritti\nnon temevano l’avversione del potere: la penna di Terzani era libera anche di cambiare idea, come\navvenuto con il maoismo in Cina. Negli ultimi anni della sua vita, colpito da un tumore all’intestino,\nraccontò la sua esperienza con la malattia nel libro Un altro giro di giostra, un viaggio per il mondo\nalla ricerca di una cura, e allo stesso tempo di quella pace interiore che troverà poi nella sua\nresidenza tra le montagne\ntoscane.\n</brano>",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: '<spiegazione>\nDurante il suo soggiorno in Cina, Terzani affrontò principalmente due sfide significative: la censura governativa e la sorveglianza costante. Questi aspetti emergono chiaramente dal brano fornito:\n\n1. **Censura governativa**: Le autorità cinesi iniziarono a infastidirsi per i suoi scritti critici verso il governo. Questo è indicato nel brano quando si dice: "Le autorità cinesi iniziarono a infastidirsi per i suoi scritti, che criticavano il governo, e iniziarono a pressarlo."\n\n2. **Sorveglianza costante**: Terzani fu sorvegliato dalle autorità cinesi, che gli assegnarono un cuoco e un autista che in realtà erano spie. Questo è evidenziato nel brano: "Inizialmente gli assegnarono un cuoco e un autista, ma Terzani si accorse che erano spie mandate per sorvegliarlo."\n\nQueste sfide culminarono nel suo arresto e nella successiva espulsione dal Paese nel 1984, come descritto nel brano: "Nel 1984 venne arrestato con l’accusa di attività controrivoluzionaria, in quanto personaggio scomodo, e fu espulso dal Paese."\n</spiegazione>',
      },
    ],
  },
] as (ChatCompletionMessageParam | ChatCompletionSystemMessageParam)[];

async function getOpenAIContent(question: Question, questionAnswers: Answer[]) {
  const questionHasBrano = !!question.branoId;
  let brano;
  if (questionHasBrano) {
    const res = await fetch(
      "https://domande-ap.mur.gov.it/api/v1/domanda/brano/" + question.branoId
    );
    brano = (await res.json()).brano;
  }
  return `${brano ? "<brano>" + brano + "</brano>\n" : ""}<quesito>${
    question.question
  }</quesito>\n<risposta>${
    questionAnswers.find((a) => a.isCorrect)?.text
  }</risposta>`;
}

export async function getOpenAIResponse(
  question: Question,
  questionAnswers: Answer[]
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API key");
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const userText = await getOpenAIContent(question, questionAnswers);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      ...systemMessages,
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userText,
          },
        ],
      },
    ],
    temperature: 0.39,
    max_tokens: 400,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  let res = response.choices[0].message.content;

  if (!res) return res;

  if (res.startsWith("<spiegazione>") && res.endsWith("</spiegazione>"))
    return res.slice(13, res.length - 14);

  res = markdownBoldToHTML(res);

  return (
    "<b>La risposta corretta è [FAVA].</b><br/>" + res.replaceAll("\n", "<br/>")
  );
}
