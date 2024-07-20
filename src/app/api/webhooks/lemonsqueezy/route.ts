import { NextRequest, NextResponse } from "next/server";
import client from "@/../prisma/db";
import { verifySignature } from "@/lib/lemonsqueezy/verifySignature";

export async function POST(req: NextRequest) {
  const exclusivePlanIds = ["440540", "443100"];
  const proPlanIds = ["440538", "443101"];
  const reqClone = req.clone() as NextRequest;
  if (!(await verifySignature(reqClone))) {
    console.error("Invalid signature.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const eventName = req.headers.get("X-Event-Name");
  if (!eventName) {
    console.error("Missing event name.");
    return NextResponse.json({ error: "Missing event name." }, { status: 400 });
  }

  if (eventName === "order_created") {
    console.log("Order created");
  } else {
    console.error("Unknown event name:", eventName);
    return NextResponse.json({ error: "Unknown event name." }, { status: 400 });
  }

  const jsonReq = await req.json();

  console.log("Request:", jsonReq);

  if (
    jsonReq.meta &&
    jsonReq.meta["custom_data"] &&
    jsonReq.meta["custom_data"]["user_id"]
  ) {
    console.log("User ID:", jsonReq.meta["custom_data"]["user_id"]);
  } else {
    console.error("Missing user ID.");
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  if (jsonReq.data?.attributes?.first_order_item?.variant_id) {
    console.log(
      "Variant ID:",
      jsonReq.data.attributes.first_order_item.variant_id,
      "typeof variant ID:",
      typeof jsonReq.data.attributes.first_order_item.variant_id
    );
  } else {
    console.error("Missing variant ID.");
    return NextResponse.json({ error: "Missing variant ID." }, { status: 400 });
  }

  const variantId = jsonReq.data.attributes.first_order_item.variant_id;

  if (exclusivePlanIds.includes(variantId.toString())) {
    await client.user.update({
      where: { id: jsonReq.meta.custom_data.user_id },
      data: {
        plan: {
          set: "EXCLUSIVE",
        },
      },
    });
  } else if (proPlanIds.includes(variantId.toString())) {
    await client.user.update({
      where: { id: jsonReq.meta.custom_data.user_id },
      data: {
        plan: {
          set: "PRO",
        },
      },
    });
  } else {
    console.error("Unknown variant ID:", variantId);
    return NextResponse.json({ error: "Unknown variant ID." }, { status: 400 });
  }

  return NextResponse.json("OK");
}
