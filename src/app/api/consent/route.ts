import { pushConsent } from "@/lib/consent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log(req);
  const { email, number, first_name, last_name, proofs } = await req.json();
  if (!email || !number || !first_name || !last_name || !proofs) {
    console.log("Missing fields");
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  let res = await pushConsent({ email, first_name, last_name, number, proofs });
  const status = res.status;
  console.log("Pushed consent", res.status);
  return NextResponse.json(await res.json(), { status });
}
