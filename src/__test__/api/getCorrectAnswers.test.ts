jest.mock("@/../prisma/db", () => ({
  __esModule: true,
  default: {
    question: { findMany: jest.fn() },
  },
}));

import { GET } from "@/app/api/getCorrectAnswers/route";
import client from "@/../prisma/db";
import { NextRequest } from "next/server";

const mockedClient = client as jest.Mocked<typeof client>;

describe("GET /api/getCorrectAnswers", () => {
  it("returns ids of correct answers", async () => {
    mockedClient.question.findMany.mockResolvedValue([
      { id: 1, answers: [{ id: 11, isCorrect: true }, { id: 12, isCorrect: false }] },
      { id: 2, answers: [{ id: 21, isCorrect: true }] },
    ] as any);
    const res = await GET(new NextRequest("http://localhost/api/getCorrectAnswers"));
    const data = await res.json();
    expect(data.data.correctAnswers).toEqual([11, 21]);
  });
});
