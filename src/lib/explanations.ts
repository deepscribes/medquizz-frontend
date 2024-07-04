import client from "@/../prisma/db";
import { Answer, Question } from "@prisma/client";
import OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
} from "openai/resources/index.mjs";

export async function isExplanationInDB(explanationId: number) {
  const question = await client.question.findUnique({
    where: {
      id: explanationId,
    },
    include: {
      explanation: true,
    },
  });

  if (!question)
    throw new Error("Question not found! Given id: " + explanationId);

  return !!question.explanation.length || false;
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
        text: "Compito: Agirai come un professore delle superiori che sta spiegando quesiti di medicina ai suoi studenti. Dovrai fornire spiegazioni essenziali e dirette, concentrando la tua risposta sulle informazioni cruciali senza divagazioni.\n\nEcco il quesito:\n\n<quesito>\n\n{{QUESITO}}\n\n</quesito>\n\nEcco la risposta al quesito:\n\n<risposta>\n\n{{RISPOSTA}}\n\n</risposta>\n\nSe viene fornito un brano, lo trovi qui:\n\n<brano>\n\n{{BRANO}}\n\n</brano>\n\nIstruzioni specifiche:\n\n1. Concisezza: Fornisci una spiegazione diretta e priva di superfluità.\n2. Precisione: Se il quesito si riferisce a un brano, identifica e cita i passaggi rilevanti per giustificare la risposta.\n3. Presentazione matematica: Utilizza il formato LaTeX per qualsiasi calcolo matematico o formula chimica.\n\nInserisci la tua spiegazione chiara e concisa qui:\n\n<spiegazione>\n\n</spiegazione>\n",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>La secrezione del glucagone è regolata da</quesito> \n<risposta>livelli di glucosio ematico</risposta>",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "<spiegazione>\n\nLa secrezione del glucagone è regolata principalmente dai livelli di glucosio nel sangue. Quando i livelli di glucosio ematico sono bassi, le cellule alfa del pancreas rilasciano glucagone. Questo ormone stimola il fegato a convertire il glicogeno in glucosio, aumentando così i livelli di glucosio nel sangue. Al contrario, quando i livelli di glucosio sono alti, la secrezione di glucagone è inibita.\n\n</spiegazione>",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>\\nQuale delle seguenti formule di struttura condensate è corretta per il 2-bromo-3-clorobutano?\\n</quesito>\\n<risposta>\\nCH3-CHBr-CHCl-CH3\\n</risposta>",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "<spiegazione>\n\nLa formula di struttura condensata corretta per il 2-bromo-3-clorobutano è \\(\\text{CH}_3-\\text{CHBr}-\\text{CHCl}-\\text{CH}_3\\). Questa formula rappresenta un butano (catena di quattro atomi di carbonio) con un atomo di bromo (Br) legato al secondo atomo di carbonio e un atomo di cloro (Cl) legato al terzo atomo di carbonio.\n\n</spiegazione>",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>\\nUna pallina da 200 g rotola su una superficie con attrito trascurabile alla\\nvelocità di 2,3 m/s. Qual è la sua quantità di moto?\\n</quesito>\\n<risposta>\\n 0,46 kg · m/s\\n</risposta>\n",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "<spiegazione>\n\nLa quantità di moto (\\(p\\)) di un oggetto è data dalla formula:\n\n\\[ p = m \\cdot v \\]\n\ndove:\n- \\(m\\) è la massa dell'oggetto,\n- \\(v\\) è la velocità dell'oggetto.\n\nIn questo caso:\n- \\(m = 200 \\, \\text{g} = 0,2 \\, \\text{kg}\\) (convertendo i grammi in chilogrammi),\n- \\(v = 2,3 \\, \\text{m/s}\\).\n\nQuindi, la quantità di moto è:\n\n\\[ p = 0,2 \\, \\text{kg} \\cdot 2,3 \\, \\text{m/s} = 0,46 \\, \\text{kg} \\cdot \\text{m/s} \\]\n\n</spiegazione>",
      },
    ],
  },
] as (ChatCompletionMessageParam | ChatCompletionSystemMessageParam)[];

async function getOpenAIContent(question: Question, questionAnswers: Answer[]) {
  let brano = false;
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
    max_tokens: 600,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  let res = response.choices[0].message.content;

  if (!res) return res;

  if (res.startsWith("<spiegazione>") && res.endsWith("</spiegazione>"))
    res = res.slice(13, res.length - 14);

  res = markdownBoldToHTML(res);

  return (
    "<b>La risposta corretta è [FAVA].</b><br/>" + res.replaceAll("\n", "<br/>")
  );
}
