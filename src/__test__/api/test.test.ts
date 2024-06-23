import client from "@/../prisma/db";

test("Prisma works", async () => {
  const res = await client.test.findMany();
  expect(res).not.toBeFalsy();
});
