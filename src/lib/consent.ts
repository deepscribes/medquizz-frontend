export type Proof = {
  content: string;
  type: string;
};

export async function pushConsent(
  email: string,
  first_name: string,
  last_name: string,
  number: string,
  proofs: Proof[]
) {
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
      // prettier-ignore
      "ApiKey": "GJfMynGxHYNoeDBAtUVPe5jRiL3k2eZx",
    },
    body: JSON.stringify({
      subject,
      legal_notices,
      proofs,
    }),
  });
}
