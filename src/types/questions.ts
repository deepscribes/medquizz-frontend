export type Question = {
  id: number;
  domanda: string;
  argomento: string;
  nro: number;
  risposte: {
    id: string;
    text: string;
  }[];
  branoId: any | null;
};

export function generateRandomQuestion() {
  return {
    id: Math.floor(Math.random() * 1000),
    domanda: "Quanto fa 2+2?",
    argomento: "Matematica",
    nro: 1,
    risposte: ["a", "b", "c", "d"].map((id) => ({
      id,
      text: Math.random().toString(36).substring(2, 20),
    })),
    branoId: null,
  };
}
