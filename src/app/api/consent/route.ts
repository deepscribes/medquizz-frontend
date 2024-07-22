import { pushConsent } from "@/lib/consent";
import { APIResponse } from "@/types/APIResponses";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
): Promise<NextResponse<APIResponse<any>>> {
  console.log(req);
  const { email, number, first_name, last_name, proofs } = await req.json();
  if (!email || !number || !first_name || !last_name || !proofs) {
    console.log("Missing fields");
    return NextResponse.json(
      { status: "error", message: "Non hai inserito tutti i campi!" },
      { status: 400 }
    );
  }
  let res = await pushConsent({ email, first_name, last_name, number, proofs });
  const status = res.status;
  console.log("Pushed consent", res.status);
  return NextResponse.json(
    { status: "ok", data: await res.json() },
    { status }
  );
}
