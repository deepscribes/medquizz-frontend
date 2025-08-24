jest.mock("@/../prisma/db", () => ({
  __esModule: true,
  default: {
    question: { findUnique: jest.fn() },
  },
}));

import { isExplanationInDB } from "@/lib/explanations";
import client from "@/../prisma/db";

const mockedClient = client as jest.Mocked<typeof client>;

describe("isExplanationInDB", () => {
  it("returns true when explanation exists", async () => {
    mockedClient.question.findUnique.mockResolvedValue({
      id: 1,
      explanation: { id: 1, text: "test" },
    } as any);
    await expect(isExplanationInDB(1)).resolves.toBe(true);
  });

  it("returns false when explanation is missing", async () => {
    mockedClient.question.findUnique.mockResolvedValue({ id: 1 } as any);
    await expect(isExplanationInDB(1)).resolves.toBe(false);
  });
});
