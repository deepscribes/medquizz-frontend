import client from "@/../prisma/db";
import { Answer, Question } from "@prisma/client";

import Anthropic from "@anthropic-ai/sdk";
import { MessageParam } from "@anthropic-ai/sdk/resources/messages.mjs";

async function getBase64ImageFromUrl(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    return base64Image;
  } catch (error) {
    console.error("Error fetching the image:", error);
    throw new Error("Could not fetch the image.");
  }
}

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

  return !!question.explanation;
}

function markdownBoldToHTML(input: string) {
  return input.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

const systemMessages = [
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>La secrezione del glucagone è regolata da</quesito> \\n<risposta>livelli di glucosio ematico</risposta>",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "<spiegazione>\\n\\nLa secrezione del glucagone è regolata principalmente dai livelli di glucosio nel sangue. Quando i livelli di glucosio ematico sono bassi, le cellule alfa del pancreas rilasciano glucagone. Questo ormone stimola il fegato a convertire il glicogeno in glucosio, aumentando così i livelli di glucosio nel sangue. Al contrario, quando i livelli di glucosio sono alti, la secrezione di glucagone è inibita.\\n\\n</spiegazione>",
      },
    ],
  },
  {
    role: "user",
    content: [
      {
        type: "text",
        text: "<quesito>\\\\nQuale delle seguenti formule di struttura condensate è corretta per il 2-bromo-3-clorobutano?\\\\n</quesito>\\\\n<risposta>\\\\nCH3-CHBr-CHCl-CH3\\\\n</risposta>",
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "<spiegazione>\\n\\nLa formula di struttura condensata corretta per il 2-bromo-3-clorobutano è \\\\(\\\\text{CH}_3-\\\\text{CHBr}-\\\\text{CHCl}-\\\\text{CH}_3\\\\). Questa formula rappresenta un butano (catena di quattro atomi di carbonio) con un atomo di bromo (Br) legato al secondo atomo di carbonio e un atomo di cloro (Cl) legato al terzo atomo di carbonio.\\n\\n</spiegazione>",
      },
    ],
  },
] as MessageParam[];

function getChatContents(question: Question, questionAnswers: Answer[]) {
  return `<quesito>${question.question}</quesito>\n<risposta>${
    questionAnswers.find((a) => a.isCorrect)?.text
  }</risposta>`;
}

export async function getClaudeResponse(
  question: Question,
  questionAnswers: Answer[]
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing OpenAI API key");
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  let newMessage = {
    role: "user",
    content: [
      {
        type: "text",
        text: getChatContents(question, questionAnswers),
      },
    ],
  } as MessageParam;

  let imageURL = question.question.includes("<img")
    ? "https://domande-ap.mur.gov.it" +
      question.question.match(/<img[^>]+src="([^">]+)"/)![1]
    : null;

  const base64Message = imageURL ? await getBase64ImageFromUrl(imageURL) : null;

  console.log(base64Message);

  if (imageURL && base64Message) {
    (
      newMessage.content as (
        | Anthropic.Messages.TextBlockParam
        | Anthropic.Messages.ImageBlockParam
        | Anthropic.Messages.ToolUseBlockParam
        | Anthropic.Messages.ToolResultBlockParam
      )[]
    ).push({
      type: "image",
      source: {
        type: "base64",
        data: base64Message,
        media_type: (await fetch(imageURL).then((r) =>
          r.headers.get("content-type")
        )) as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
      },
    });
  }

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",

    max_tokens: 692,
    temperature: 0.2,
    system:
      "Sei un professore di liceo che spiega questioni mediche ai tuoi studenti. Il tuo compito è fornire spiegazioni chiare, concise e mirate dei concetti medici. Segui attentamente queste istruzioni:\n\n1. Leggi il seguente quesito:\n<quesito>\n{QUESITO}\n</quesito>\n\n2. La risposta corretta a questa domanda è:\n<risposta>\n{RISPOSTA}\n</risposta>\n\n3. Fornisci una spiegazione chiara e concisa della risposta. La tua spiegazione dovrebbe:\n   - Essere diretta e priva di informazioni non necessarie\n   - Se il quesito si riferisce a un passaggio fornito, identificare e citare le parti rilevanti per giustificare la risposta\n   - Utilizzare il formato LaTeX per qualsiasi calcolo matematico o formula chimica (es., \\(E = mc^2\\))\n\n5. Presenta la tua spiegazione all'interno dei tag <spiegazione>. Non includere altri testi o tag al di fuori dei tag <spiegazione>.\n\n6. Assicurati che la tua spiegazione sia informativa ma breve, concentrandoti sui punti chiave che affrontano direttamente il quesito e giustificano la risposta.\n\nRicorda, il tuo obiettivo è aiutare gli studenti a comprendere i concetti fondamentali senza sopraffarli con dettagli eccessivi. Fornisci una spiegazione chiara, accurata e concisa che affronti direttamente il quesito e supporti la risposta data.",
    messages: [...systemMessages, newMessage],
  });

  let res =
    response.content[0].type === "text" ? response.content[0].text : null;

  if (!res) return res;

  if (res.startsWith("<spiegazione>") && res.endsWith("</spiegazione>"))
    res = res.slice(13, res.length - 14);

  res = markdownBoldToHTML(res);

  return (
    "<b>La risposta corretta è [FAVA].</b><br/>" + res.replaceAll("\n", "<br/>")
  );
}
