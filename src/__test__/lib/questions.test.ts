jest.mock("@/../prisma/db", () => ({
  __esModule: true,
  default: {
    question: { findMany: jest.fn() },
    test: { findMany: jest.fn() },
  },
}));
jest.mock("@aws-sdk/lib-dynamodb");

import { fetchRandomQuestionsFromSubject } from "@/lib/questions";
import client from "@/../prisma/db";

const mockedClient = client as jest.Mocked<typeof client>;

const sampleQuestions = [
  { id: 1, subject: "fisica", number: 1, question: "Q1", answers: [] },
  { id: 2, subject: "fisica", number: 2, question: "Q2", answers: [] },
  { id: 3, subject: "fisica", number: 3, question: "Q3", answers: [] },
];

describe("fetchRandomQuestionsFromSubject", () => {
  it("returns at most the requested number of questions", async () => {
    mockedClient.question.findMany.mockResolvedValue(sampleQuestions);
    const res = await fetchRandomQuestionsFromSubject("fisica", 2, null);
    expect(res.length).toBeLessThanOrEqual(2);
  });

  it("excludes previously answered questions", async () => {
    mockedClient.test.findMany.mockResolvedValue([
      { correctQuestions: [1], wrongQuestions: [] },
    ] as any);
    mockedClient.question.findMany.mockResolvedValue(sampleQuestions);
    const res = await fetchRandomQuestionsFromSubject("fisica", 5, "user1");
    expect(res.some((q) => q.id === 1)).toBe(false);
  });

  it("handles legacy connect format", async () => {
    mockedClient.test.findMany.mockResolvedValue([
      {
        correctQuestions: { connect: [{ id: 1 }] },
        wrongQuestions: { connect: [{ id: 2 }] },
      },
    ] as any);
    mockedClient.question.findMany.mockResolvedValue(sampleQuestions);
    const res = await fetchRandomQuestionsFromSubject("fisica", 5, "user1");
    expect(res.some((q) => q.id === 1 || q.id === 2)).toBe(false);
  });
});
