export type Proof = {
  content: string;
  form: string;
};

/**
 * Type of the consent object that is sent to Iubenda
 * @property {string} email - The email of the user
 * @property {string} number - The phone number of the user
 * @property {string} first_name - The first name of the user
 * @property {string} last_name - The last name of the user
 * @property {string} proofs - The HTML of the page / form after filling it out
 */
export type Consent = {
  email: string;
  number?: string;
  first_name: string;
  last_name: string;
  proofs: Proof[];
};
