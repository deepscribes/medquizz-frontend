import { QuestionWithAnswers } from "@/lib/questions";
import { Answer, Test } from "@prisma/client";

export enum Subject {
  Completo = "completo",
  Rapido = "rapido",
  Fisica = "fisica",
  Biologia = "biologia",
  Chimica = "chimica",
  Lettura = "lettura",
  Logica = "logica",
  Ripasso = "ripasso",
}

export type UserTestWithQuestionsAndAnswers = Test & {
  answers: Answer[];
  correctQuestions: QuestionWithAnswers[];
  wrongQuestions: QuestionWithAnswers[];
  notAnsweredQuestions: QuestionWithAnswers[];
};
