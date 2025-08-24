import type { Consent } from "@/types/consent";
import { pushConsent } from "@/lib/consent";

test.skip("Generate new consent with mock email and phone number", async () => {
  const mockConsent: Consent = {
    email: "mock@test.com",
    number: "+15555550100",
    first_name: "Mock",
    last_name: "User",
    proofs: [
      {
        content: "Mock proof HTML",
        form: "<p>Mock proof</p>",
      },
    ],
  };

  const result = await pushConsent(mockConsent);
  expect(result.status).toBe(200);
});

test.skip("Generate new consent with real email and phone number", async () => {
  const mockConsent: Consent = {
    email: "nicolamigone179@gmail.com",
    number: "+393388267756",
    first_name: "Nicola",
    last_name: "Migone",
    proofs: [
      {
        content: "Mock proof HTML",
        form: "<p>Mock proof</p>",
      },
    ],
  };

  const result = await pushConsent(mockConsent);
  expect(result.status).toBe(200);
});

test("Generate new consent without data", async () => {
  await expect(pushConsent({} as Consent)).rejects.toThrow(
    "Missing Iubenda API key"
  );
});
