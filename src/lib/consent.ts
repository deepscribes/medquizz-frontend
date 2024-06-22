import { Consent } from "@/types/consent";

export async function pushConsent(consent: Consent) {
  const iubendaAPIKey = process.env.IUBENDA_PRIVATE_API_KEY;
  if (!iubendaAPIKey) {
    throw new Error("Missing Iubenda API key");
  }
  const { email, first_name, last_name, number, proofs } = consent;
  if (!email || !first_name || !last_name || !proofs) {
    throw new Error("Missing required fields");
  }
  let subject: any = {
    email,
    first_name,
    last_name,
    full_name: `${first_name} ${last_name}`,
    verified: true,
  };

  if (number && !number.startsWith("+1555")) {
    subject = { ...subject, phones: [{ number, verified: true }] };
  }

  const legal_notices = [
    {
      identifier: "privacy_policy",
    },
    {
      identifier: "cookie_policy",
    },
    {
      identifier: "term",
    },
  ];

  return fetch("https://consent.iubenda.com/consent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ApiKey: iubendaAPIKey,
    },
    body: JSON.stringify({
      subject,
      legal_notices,
      proofs,
    }),
  });
}
