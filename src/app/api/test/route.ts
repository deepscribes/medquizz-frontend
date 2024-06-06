import { NextRequest, NextResponse } from "next/server";
import client from "@/../prisma/db";
import { auth } from "@clerk/nextjs/server";
import { createUserIfNotExists } from "@/lib/createUserIfNotExists";

export default async function GET(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ message: "Not logged in!" }, { status: 401 });
  }

  await createUserIfNotExists(userId);

  const res = await client.test.findMany({
    where: {
      userId,
    },
    include: {
      questions: true,
    },
  });
  return NextResponse.json(res);
}
