import { pushConsent } from "@/lib/consent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, first_name, last_name, proofs } = await req.json();
  let res = await pushConsent(email, first_name, last_name, proofs);
  const status = res.status;

  return NextResponse.json(await res.json(), { status });
}
