import { Subject } from "@/types";

const timeoutms = 30000;

const countData = {
  count: 10,
};

const from = Math.floor(Math.random() * 35);
const to = Math.floor(Math.random() * 35) + from;

const fromToData = {
  from,
  to,
};

const fromToCountData = {
  ...countData,
  ...fromToData,
};

const subjectsWithoutCompletoAndRapido = Object.values(Subject).filter(
  (s) => s !== Subject.Completo && s !== Subject.Rapido && s !== Subject.Ripasso
);

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}


test("To receive some new questions with no subject and no data", async () => {
  const response = await fetch("http://localhost:3000/api/getQuestions");
  expect(response.status).toBe(400);
  await response.json();
});

describe("To receive some new questions with a subject but no data", () => {
  for (const subject of subjectsWithoutCompletoAndRapido) {
    test(`To receive some new questions with the subject ${subject}`, async () => {
      const response = await fetch(
        `http://localhost:3000/api/getQuestions?subject=${subject}`
      );
      expect(response.status).toBe(400);
      await response.json();
    });
  }
  test(`To receive 60 new questions with the subject completo`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=completo`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(60);
  });
  test(`To receive 30 new questions with the subject rapido`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=rapido`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(30);
  });
});

describe("To receive some new questions with a subject and count", () => {
  for (const subject of subjectsWithoutCompletoAndRapido) {
    test(`To receive some new questions with the subject ${subject} and count`, async () => {
      const response = await fetch(
        `http://localhost:3000/api/getQuestions?subject=${subject}&count=${countData.count}`
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.questions.length).toBe(countData.count);
    });
  }
  test(`To receive some new questions with the subject completo and count`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=completo&count=${countData.count}`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(60);
  });
  test(`To receive some new questions with the subject rapido and count`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=rapido&count=${countData.count}`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(30);
  });
});

describe("To receive some new questions with a subject and from/to", () => {
  for (const subject of subjectsWithoutCompletoAndRapido) {
    test(`To receive some new questions with the subject ${subject} and from/to`, async () => {
      const response = await fetch(
        `http://localhost:3000/api/getQuestions?subject=${subject}&from=${fromToData.from}&to=${fromToData.to}`
      );
      expect(response.status).toBe(200);
      const data = await response.json(); // + 1 because it's inclusive
      expect(data.questions.length).toBe(fromToData.to - fromToData.from + 1);
    });
  }
  test(`To receive some new questions with the subject completo and from/to`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=completo&from=${fromToData.from}&to=${fromToData.to}`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(60);
  });
  test(`To receive some new questions with the subject rapido and from/to`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=rapido&from=${fromToData.from}&to=${fromToData.to}`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(30);
  });
});

describe("To receive some new questions with a subject and invalid from/to", () => {
  for (const subject of subjectsWithoutCompletoAndRapido) {
    test(`To receive some new questions with the subject ${subject} and from/to`, async () => {
      const response = await fetch(
        `http://localhost:3000/api/getQuestions?subject=${subject}&from=${fromToData.to}&to=${fromToData.from}`
      );
      expect(response.status).toBe(400);
    });
  }
});

describe("To receive some new questions with a subject, count and from/to", () => {
  for (const subject of subjectsWithoutCompletoAndRapido) {
    test(`To receive some new questions with the subject ${subject}, count and from/to`, async () => {
      const response = await fetch(
        `http://localhost:3000/api/getQuestions?subject=${subject}&count=${fromToCountData.count}&from=${fromToCountData.from}&to=${fromToCountData.to}`
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.questions.length).toBe(fromToCountData.count);
    });
  }
  test(`To receive some new questions with the subject completo, count and from/to`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=completo&count=${fromToCountData.count}&from=${fromToCountData.from}&to=${fromToCountData.to}`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(60);
  });
  test(`To receive some new questions with the subject rapido, count and from/to`, async () => {
    const response = await fetch(
      `http://localhost:3000/api/getQuestions?subject=rapido&count=${fromToCountData.count}&from=${fromToCountData.from}&to=${fromToCountData.to}`
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.questions.length).toBe(30);
  });
});
