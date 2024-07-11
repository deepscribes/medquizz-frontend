"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ClerkAPIResponseError } from "@clerk/shared/error";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CTA } from "@/components/ui/cta";
import { OTPInput } from "@/components/ui/otpInput";
import { isPhoneValid } from "@/lib/phoneutils";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { redirectAfterAuth } from "@/lib/redirectAfterAuth";

export default function Page() {
  const { userId } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verifying, setVerifying] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [areTermsAgreed, setIsCommercialConsentGiven] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      redirectAfterAuth(router, {
        defaultRedirectAction: "back",
      });
    }
  }, [userId, router, isLoaded, signUp]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isLoading) {
      console.log("Don't spam the button!");
      return;
    }

    setIsLoading(true);

    if (!name || !surname || !email || !phone) {
      console.error("You must fill all the fields.");
      setErrorMessage(
        "Devi compilare tutti i campi obbligatori, contrassegnati da un asterisco."
      );
      setIsLoading(false);
      return;
    }

    if (!areTermsAgreed || !isPrivacyAgreed) {
      console.error("You must agree to the terms and conditions.");
      setErrorMessage("Devi accettare l'informativa sulla privacy .");
      setIsLoading(false);
      return;
    }

    if (!isLoaded && !signUp) {
      setIsLoading(false);
      return null;
    }

    if (!isPhoneValid(phone)) {
      setIsLoading(false);
      setErrorMessage("Il numero di telefono non è valido.");
      return;
    }

    try {
      // Record consent
      const proof = document.getElementById("sign-up-form")?.innerHTML;
      if (!proof) {
        throw new Error(
          "Non è stato possibile registrare il consenso. Errore: ELEMENT_NOT_FOUND"
        );
      }
      let res = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: name,
          last_name: surname,
          number: phone,
          proofs: [{ content: "proof_html", form: proof }],
        }),
      });

      if (res.status >= 300) {
        console.warn("Phone number was likely invalid, retrying without it.");
        // Retry without the phone number
        res = await fetch("/api/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            first_name: name,
            last_name: surname,
            proofs: [proof],
          }),
        });
      }

      if (res.status !== 200) {
        setIsLoading(false);
        throw new Error(
          "C'è stato un errore durante la registrazione del consenso."
        );
      }

      await res.json();

      // Start the sign-up process using the phone number method
      await signUp.create({
        phoneNumber: phone,
        emailAddress: email,
        firstName: name,
        lastName: surname,
      });

      // Start the verification - a SMS message will be sent to the
      // number with a one-time code
      await signUp.preparePhoneNumberVerification();
      // Set verifying to true to display second form and capture the OTP code
      setVerifying(true);
      setErrorMessage("");
      setIsLoading(false);
    } catch (err: any) {
      console.log("An error occurred while logging in:", err);
      if (!err || !err.errors) {
        setErrorMessage((prev) => prev || "Errore sconosciuto");
        setIsLoading(false);
        return;
      }
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      const errMsg =
        (err as ClerkAPIResponseError).errors && err.errors.length
          ? err.errors[0].longMessage
          : null;
      setErrorMessage(
        "Errore durante l'invio del codice di verifica: " + errMsg ||
          "Errore sconosciuto"
      );
      setIsLoading(false);
    }
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();

    // Avoid duplicate submissions
    if (isLoading) {
      console.log("Still loading, don't spam the button!");
      return;
    }

    setIsLoading(true);

    if (!isLoaded && !signUp) {
      setIsLoading(false);
      return null;
    }

    try {
      // Use the code provided by the user and attempt verification
      const signUpAttempt = await signUp.attemptPhoneNumberVerification({
        code,
      });

      console.log("Sign up attempt:", signUpAttempt);

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        // Send login data to lambda function
        // const res = await fetch("/api/telemetry");
        // await res.json();
        redirectAfterAuth(router, {
          defaultRedirectAction: "back",
        });
        setIsLoading(false);
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signUpAttempt);
        setErrorMessage("C'è stato un errore:" + signUpAttempt.status);
        setIsLoading(false);
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (Object.keys(err).length === 0 && err.constructor === Object) {
        console.warn("No error object found, not setting error message.");
        setIsLoading(false);
        return;
      }
      console.error("Error:", JSON.stringify(err, null, 2));
      const errMsg = (err as ClerkAPIResponseError).errors[0].message;
      setErrorMessage(
        "Errore durante l'invio del codice di verifica: " + errMsg ||
          "Errore sconosciuto"
      );
      setIsLoading(false);
    }
    setIsLoading(false);
  }

  if (verifying) {
    return (
      <>
        <div className="h-full flex flex-row justify-center items-center align-middle">
          <Container>
            <form
              onSubmit={handleVerification}
              className="mx-auto flex flex-col gap-y-3"
            >
              <h1 className="font-bold text-center text-xl -my-2 ">Verifica</h1>
              <div
                className={`flex flex-col ${
                  errorMessage && !code ? "text-red-400" : ""
                }`}
              >
                <Label
                  htmlFor="codice"
                  className="font-light text-center text-sm text-gray-500"
                >
                  Inserisci il codice di verifica inviato a {phone}
                </Label>
                <OTPInput
                  value={code}
                  onChange={(e) => setCode(e)}
                  disabled={isLoading}
                />
              </div>
              <p>
                <small className="text-red-400">{errorMessage}</small>
              </p>
              <button type="submit">
                <CTA id="submit" type="submit">
                  Continua
                </CTA>
              </button>
            </form>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-full flex flex-row justify-center items-center align-middle">
        <Container>
          <form
            onSubmit={handleSubmit}
            id="sign-up-form"
            className="max-w-full flex flex-col gap-y-3"
          >
            <h1 className="font-bold text-center text-xl">Benvenuto 🎉</h1>
            <p className="font-light text-center text-sm text-gray-500">
              Compila i dettagli per visualizzare il report completo con i
              quesiti commentati
            </p>
            <div className="flex flex-row justify-start items-stretch my-2 gap-x-4 flex-wrap md:flex-nowrap">
              <div
                className={`flex flex-col items-stretch relative ${
                  errorMessage && !name ? "text-red-400" : ""
                }`}
              >
                <Label htmlFor="name">Nome</Label>
                <Input
                  required
                  className="max-w-[150px]"
                  type="text"
                  alt="nome"
                  name="nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div
                className={`flex flex-col items-stretch relative ${
                  errorMessage && !surname ? "text-red-400" : ""
                }`}
              >
                <Label htmlFor="surname">Cognome</Label>
                <Input
                  required
                  className="max-w-[150px]"
                  type="text"
                  alt="cognome"
                  name="cognome"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </div>
            </div>
            <div
              className={`flex flex-col ${
                errorMessage && !email ? "text-red-400" : ""
              }`}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                required
                type="email"
                alt="indirizzo email"
                name="email"
                value={email}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div
              className={`flex flex-col ${
                errorMessage && !isPhoneValid(phone) ? "text-red-400" : ""
              }`}
            >
              <Label htmlFor="phone-num">Numero di telefono</Label>
              <PhoneInput
                forceDialCode={true}
                inputClassName="w-full"
                defaultCountry="it"
                preferredCountries={["it", "us"]}
                value={phone}
                onChange={(p) => setPhone(p)}
                countrySelectorStyleProps={{
                  buttonClassName: "!p-2",
                }}
              />
            </div>
            <div
              className={`flex flex-row items-center mt-6 ${
                errorMessage && !isPrivacyAgreed
                  ? "text-red-400"
                  : "text-gray-700"
              }`}
            >
              <input
                required
                className="mr-2 w-4 h-4"
                type="checkbox"
                id="privacy"
                name="privacy"
                value="privacy"
                onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
              />
              <label htmlFor="terms" className="text-xs">
                Accetto l&apos;
                <a
                  className="underline"
                  href="https://www.iubenda.com/privacy-policy/13243820"
                >
                  Informativa sulla Privacy
                </a>{" "}
              </label>
            </div>
            <div
              className={`flex flex-row items-center ${
                errorMessage && !areTermsAgreed
                  ? "text-red-400"
                  : "text-gray-700"
              }`}
            >
              <div className="w-max">
                <input
                  required
                  className="mr-2 w-4 h-4"
                  type="checkbox"
                  id="commercialConsent"
                  name="commercialConsent"
                  value="commercialConsent"
                  onChange={(e) =>
                    setIsCommercialConsentGiven(e.target.checked)
                  }
                />
              </div>
              <label htmlFor="terms" className="text-xs">
                Accetto che i miei dati personali vengano elaborati e ceduti a
                terzi per scopi commerciali, come dettagliato nella{" "}
                <a
                  className="underline"
                  href="https://www.iubenda.com/privacy-policy/13243820"
                >
                  Informativa sulla Privacy
                </a>{" "}
              </label>
            </div>
            <small
              className="text-red-400 my-3"
              dangerouslySetInnerHTML={{ __html: errorMessage }}
            ></small>
            <button type="submit" disabled={isLoading}>
              <CTA id="submit" type="submit" disabled={isLoading}>
                Continua
              </CTA>
            </button>
            <p className="font-light text-center text-sm mt-2">
              Hai già un account?{" "}
              <a href="/sign-in" className="text-primary-pressed font-semibold">
                Accedi
              </a>
              .
            </p>
          </form>
        </Container>
      </div>
    </>
  );
}
