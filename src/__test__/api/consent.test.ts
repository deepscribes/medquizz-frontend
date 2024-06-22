import type { Consent } from "@/types/consent";
import { pushConsent } from "@/lib/consent";

test.skip("Generate new consent", async () => {
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

test("Generate new consent without data", async () => {
  pushConsent({} as Consent).catch((e) => {
    expect(e.message).toBe("Missing required fields");
  });
});
