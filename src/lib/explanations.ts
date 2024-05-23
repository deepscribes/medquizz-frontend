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
        text: "sei uno studente delle superiori e ti stai preparando per il test di medicina, ogni volta che riceverai un quesito con la relativa risposta mi fornirai una spiegazione CONCISA  e CHIARA, tutti i calcoli matematici e formule chimiche  restituiscimele in formato LATEX",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "Quesito: La secrezione del glucagone è regolata da\nRisposta: livelli di glucosio ematico\n",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "La secrezione del glucagone è principalmente regolata dai livelli di glucosio nel sangue. Quando i livelli di glucosio ematico sono bassi, le cellule alfa del pancreas rilasciano glucagone. Questo ormone agisce sul fegato per stimolare la glicogenolisi (la degradazione del glicogeno in glucosio) e la gluconeogenesi (la sintesi di nuovo glucosio), aumentando così i livelli di glucosio nel sangue. Al contrario, quando i livelli di glucosio sono alti, la secrezione di glucagone viene inibita.",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "Quesito: Una pallina da 200 g rotola su una superficie con attrito trascurabile alla\nvelocità di 2,3 m/s. Qual è la sua quantità di moto?\nRisposta: 0,46 kg · m/s",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "La quantità di moto (o momento lineare) di un oggetto è data dal prodotto della sua massa per la sua velocità. La formula è:\n\n\\[ p = m \\cdot v \\]\n\nDove:\n- \\( p \\) è la quantità di moto,\n- \\( m \\) è la massa dell'oggetto,\n- \\( v \\) è la velocità dell'oggetto.\n\nNel nostro caso, la massa \\( m \\) della pallina è 200 g, che convertiamo in chilogrammi (1 kg = 1000 g):\n\n\\[ m = 200 \\, \\text{g} = 0{,}200 \\, \\text{kg} \\]\n\nLa velocità \\( v \\) è:\n\n\\[ v = 2{,}3 \\, \\text{m/s} \\]\n\nCalcoliamo la quantità di moto:\n\n\\[ p = 0{,}200 \\, \\text{kg} \\cdot 2{,}3 \\, \\text{m/s} = 0{,}46 \\, \\text{kg} \\cdot \\text{m/s} \\]\n\nQuindi, la quantità di moto della pallina è \\( 0{,}46 \\, \\text{kg} \\cdot \\text{m/s} \\).",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "Quesito: Quale delle seguenti formule di struttura condensate è corretta per il 2-bromo-3-clorobutano? Risposta: CH3-CHBr-CHCl-CH3",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "Per determinare la formula di struttura condensata corretta per il 2-bromo-3-clorobutano, dobbiamo considerare la posizione dei sostituenti (bromo e cloro) sulla catena principale di carbonio.\n\nIl butano ha una catena principale di quattro atomi di carbonio: \n\n\\[ \\text{CH}_3-\\text{CH}_2-\\text{CH}_2-\\text{CH}_3 \\]\n\nNel 2-bromo-3-clorobutano, il bromo (Br) è attaccato al secondo atomo di carbonio e il cloro (Cl) è attaccato al terzo atomo di carbonio. La catena principale diventa quindi:\n\n\\[ \\text{CH}_3-\\text{CH}(\\text{Br})-\\text{CH}(\\text{Cl})-\\text{CH}_3 \\]\n\nQuesta è la formula di struttura condensata corretta per il 2-bromo-3-clorobutano:\n\n\\[ \\text{CH}_3-\\text{CHBr}-\\text{CHCl}-\\text{CH}_3 \\]\n\nQuindi, la risposta corretta è:\n\n\\[ \\text{CH}_3-\\text{CHBr}-\\text{CHCl}-\\text{CH}_3 \\]",
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
  return `${brano ? "Brano: " + brano + "\n\n" : ""}Quesito: ${
    question.question
  }\nRisposta corretta: ${questionAnswers.find((a) => a.isCorrect)?.text}`;
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

  // If res starts with "Your response: ", remove it
  if (res.startsWith("Your response: ")) {
    res = res.slice("Your response: ".length);
  }

  res = markdownBoldToHTML(res);

  return (
    "<b>La risposta corretta è [FAVA].</b><br/>" + res.replaceAll("\n", "<br/>")
  );
}
