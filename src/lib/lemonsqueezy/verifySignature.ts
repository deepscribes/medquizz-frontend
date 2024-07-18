import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

export async function verifySignature(request: NextRequest): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("Lemonsqueezy secret not found.");
    throw new Error("Lemonsqueezy secret not found.");
  }
  const hmac = createHmac("sha256", secret);
  const digest = Buffer.from(
    hmac.update(await request.text()).digest("hex"),
    "utf8"
  );
  const signature = Buffer.from(
    request.headers.get("X-Signature") || "",
    "utf8"
  );

  if (!timingSafeEqual(digest, signature)) {
    console.error("Invalid signature");
    return false;
  }

  console.log("Signature verified");

  return true;
}
