import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const client = new PrismaClient();

  const res = await client.answer.findMany({
    select: {
      id: true,
    },
    where: {
      isCorrect: true,
    },
  });

  return NextResponse.json(res.map((a) => a.id));
}
