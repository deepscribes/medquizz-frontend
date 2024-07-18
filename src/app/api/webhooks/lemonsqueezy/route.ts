import { NextRequest, NextResponse } from "next/server";

import { verifySignature } from "@/lib/lemonsqueezy/verifySignature";

export async function POST(req: NextRequest) {
  if (!(await verifySignature(req))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const eventName = req.headers.get("X-Event-Name");
  if (!eventName) {
    return NextResponse.json({ error: "Missing event name." }, { status: 400 });
  }

  if (eventName === "order_created") {
    console.log("Order created");
  } else {
    console.log("Unknown event name:", eventName);
  }

  return NextResponse.json("OK");
}
