import client from "@/../prisma/db";
import { createUserIfNotExists } from "@/lib/createUserIfNotExists";

beforeAll(async () => {
  try {
    await client.user.delete({
      where: {
        id: "test",
      },
    });
  } catch (e) {}
});

test("Try to create a user without an id", async () => {
  expect.assertions(1);
  try {
    // @ts-ignore
    await createUserIfNotExists();
  } catch (e) {
    if (e instanceof Error) expect(e.message).toBe("userId is not defined");
    else fail("Error is not an instance of Error");
  }
});

test("Try to create a user that doesn't exist", async () => {
  await createUserIfNotExists("test");
  const user = await client.user.findUnique({
    where: {
      id: "test",
    },
  });
  expect(user).toBeTruthy();
});

test("Try to create a user that already exists", async () => {
  await createUserIfNotExists("test");
  const user = await client.user.findUnique({
    where: {
      id: "test",
    },
  });
  expect(user).toBeTruthy();
});

afterAll(async () => {
  await client.user.delete({
    where: {
      id: "test",
    },
  });
});
