export enum Plan {
  BASIC = "BASIC",
  PRO = "PRO",
  EXCLUSIVE = "EXCLUSIVE",
}

export interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
  domandaId: number;
}

export interface Question {
  id: number;
  question: string;
  subject: string;
  number: number;
  answers?: Answer[];
}

export interface Test {
  id: number | string;
  score: number;
  maxScore: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  correctQuestions?: (Question | number)[];
  wrongQuestions?: (Question | number)[];
  notAnsweredQuestions?: (Question | number)[];
  answers?: Answer[];
  userId: string;
}

export interface User {
  id: string;
  tests?: Test[];
  plan: Plan;
  wrongQuestions?: Question[];
  wrongQuestionIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Explanation {
  id: number;
  text: string;
  createdAt?: string;
  updatedAt?: string;
  questionId: number;
}

