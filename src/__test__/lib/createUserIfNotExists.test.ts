jest.mock("@/../prisma/db", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { createUserIfNotExists } from "@/lib/createUserIfNotExists";
import client from "@/../prisma/db";

const mockedClient = client as jest.Mocked<typeof client>;

beforeEach(() => {
  jest.clearAllMocks();
});

test("throws when user id is missing", async () => {
  // @ts-ignore
  await expect(createUserIfNotExists()).rejects.toThrow("userId is not defined");
});

test("creates user when it does not exist", async () => {
  mockedClient.user.findUnique.mockResolvedValueOnce(null);
  mockedClient.user.create.mockResolvedValueOnce({ id: "test" } as any);
  const res = await createUserIfNotExists("test");
  expect(mockedClient.user.create).toHaveBeenCalled();
  expect(res.id).toBe("test");
});

test("returns existing user without creating", async () => {
  const existing = { id: "test" } as any;
  mockedClient.user.findUnique.mockResolvedValueOnce(existing);
  const res = await createUserIfNotExists("test");
  expect(mockedClient.user.create).not.toHaveBeenCalled();
  expect(res).toBe(existing);
});
