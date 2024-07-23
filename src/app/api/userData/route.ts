import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { createUserIfNotExists } from "@/lib/createUserIfNotExists";
import { User } from "@prisma/client";
import { APIResponse } from "@/types/APIResponses";

export type UserDataAPIResponse = {
  user: User;
};

export async function GET(): Promise<
  NextResponse<APIResponse<UserDataAPIResponse>>
> {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json(
      {
        status: "error",
        message: "Non autorizzato",
      },
      {
        status: 401,
      }
    );
  }
  const user = await createUserIfNotExists(userId);

  return NextResponse.json({ status: "ok", data: { user } });
}
