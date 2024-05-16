import client from "@/../prisma/db";
import { Answer, Question } from "@prisma/client";
import OpenAI from "openai";
import {
  dbSubjectToRemoteImageSubjectType,
  isRemoteImageSubjectType,
} from "./index";

export async function isExplanationInDB(explanationId: number) {
  return !!(await client.explanation.findUnique({
    where: { questionId: explanationId },
  }));
}

function getOpenAIContent(question: Question, questionAnswers: Answer[]) {
  const AcharCode = 65; // The char code for the ASCII character 'A'
  return `Domanda N° ${question.jsonid} ${formatImage(
    question.question,
    question.subject
  )}\nRisposte:\n ${questionAnswers.map(
    (answer, i) =>
      String.fromCharCode(AcharCode + i) +
      ") " +
      formatImage(answer.text, question.subject) +
      "\n"
  )}
    \n\nRisposta corretta: ${String.fromCharCode(
      AcharCode + questionAnswers.map((q) => q.isCorrect).indexOf(true)
    )}\n\n`;
}

function formatImage(s: string, sub: string) {
  if (!s.includes("includegraphics")) return s;
  sub = dbSubjectToRemoteImageSubjectType(sub);
  if (!isRemoteImageSubjectType(sub)) {
    throw new Error("Invalid subject type in insertImageInText, got " + sub);
  }
  // When includegraphics{asd.png} is found, replace it with an img tag
  return s.replace(
    /includegraphics{(.+?)}/g,
    `<img src="https://domande-ap.mur.gov.it/assets/includeGraphics/${sub}/$1"/>`
  );
}

function findIncludeGraphics(str: string) {
  // Define the regex pattern to match \includegraphics{xyz.png}
  const regex = /includegraphics\{([^}]+)\.png\}/g;

  // Initialize an array to hold the matches
  let matches = [];
  let match;

  // Use regex.exec to find all matches
  while ((match = regex.exec(str)) !== null) {
    matches.push(match[1]);
  }

  return matches;
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

  const content = getOpenAIContent(question, questionAnswers);

  const images = findIncludeGraphics(question.question);
  for (const answer of questionAnswers) {
    images.push(...findIncludeGraphics(answer.text));
  }

  console.log(images);

  const formattedImages = images.map(
    (img) =>
      ({
        type: "image_url",
        image_url: {
          detail: "high",
          url: `https://domande-ap.mur.gov.it/assets/includeGraphics/${dbSubjectToRemoteImageSubjectType(
            question.subject
          )}/${img}.png`,
        },
      } as const)
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          'Come professore eccezionale, spiega passaggio per passaggio e in maniera concisa perché la risposta corretta è effettivamente corretta. Utilizza i tag <sub> e <sup> per caratteri speciali come pedici e apici. Riceverai una domanda alla volta, insieme alle scelte di risposta e a quella corretta, ma fornisci questa spiegazione in italiano. Le domande possono avere delle immagini, in allegato, indicate con includegraphics{}. Limitati a fornire la spiegazione diretta del motivo per cui è corretta e dimentica le opzioni sbagliate così non ti dilunghi.\nInizia con "<b>La risposta corretta è la {lettera})</b>", come nell\'esempio.\n\nESEMPI\nDomanda N°1: Per quale valore di k vale <sup>k</sup>√49<sup>3</sup> = √7?\nRisposte: A) k = 12\nB) k = 6\nC) k = 4\nD) k = 2\nE) k = 3\n\nRisposta Corretta: A)\n\nTua spiegazione: <b>La risposta corretta è la [A].</b> Utilizzando le proprietà delle potenze si otterrà:\n7<sup>6/k</sup> = 7 <sup>1/2</sup> -> k = 12\n',
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: content,
          },
          ...formattedImages,
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const res = response.choices[0].message.content;

  if (!res) return res;

  // If res starts with "Your response: ", remove it
  if (res.startsWith("Your response: ")) {
    return res.slice("Your response: ".length);
  }

  return res;
}
