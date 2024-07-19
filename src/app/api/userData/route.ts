import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import client from "@/../prisma/db";

export async function GET(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const user = await client.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return NextResponse.json({ user });
}
