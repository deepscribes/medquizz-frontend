import { Question } from "@/types/questions";

function Answer({
  answer,
  selected,
}: {
  answer: Question["risposte"][number];
  selected: boolean;
}) {
  return (
    <>
      <div
        className={`flex flex-row gap-x-4 items-center p-4 ${
          selected ? "bg-[#E0F2FF]" : "bg-[#F7F7F7]"
        } ${
          selected ? "border-[#37B0FE]" : "border-[#9D9D9D]"
        } border rounded-md`}
      >
        <div
          className={`flex w-12 h-12 text-center justify-center items-center font-extrabold text-xl ${
            selected ? "bg-primary text-white" : "bg-white text-black"
          } border border-gray-500 rounded-md capitalize`}
        >
          {answer.id}
        </div>
        <p className="">{answer.text}</p>
      </div>
    </>
  );
}

export function QuestionRender({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (answer: string) => void;
}) {
  return (
    <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border boder-[#B3B3B3]">
      <small className="text-sm text-gray-500 text-left">
        {question.argomento}
      </small>
      <h1 className="text-xl font-bold text-left">
        {question.id}. {question.domanda}
      </h1>
      <div className="flex flex-col space-y-2">
        {question.risposte.map((answer) => (
          <button
            key={answer.id}
            className="p-2 rounded text-left"
            onClick={() => onAnswer(answer.id)}
          >
            <Answer answer={answer} selected={answer.id == "a"} />
          </button>
        ))}
      </div>
      <div className="flex flex-row justify-between p-2">
        <button className="text-[#999999] text-xl">Indietro</button>
        <button className="text-[#37B0FE] text-xl font-bold">Avanti</button>
      </div>
    </div>
  );
}
