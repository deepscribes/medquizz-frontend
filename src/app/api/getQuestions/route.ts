import { Prisma, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const client = new PrismaClient();

  const res = await client.question.findMany({
    include: {
      answers: true,
    },
    take: 60,
    orderBy: {
      question: "asc",
    },
  });
  return NextResponse.json(res);
}
