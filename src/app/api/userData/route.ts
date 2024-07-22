import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { createUserIfNotExists } from "@/lib/createUserIfNotExists";

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
  const user = await createUserIfNotExists(userId);

  return NextResponse.json({ user });
}
