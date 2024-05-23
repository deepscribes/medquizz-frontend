"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ClerkAPIResponseError } from "@clerk/shared/error";
import { isPhoneValid } from "@/lib/phoneutils";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

function translateClerkAPIResponseText(error: {
  message: string;
  code: string;
}) {
  switch (error.code) {
    case "form_identifier_exists":
      return 'Esiste già un account con questo numero di telefono. <a href="sign-in" class="underline"> Stai per caso cercando di accedere? </a>';
    default:
      return error.message;
  }
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={`border rounded-md border-gray-300 p-1 px-2 flex-1 ${className}`}
      {...rest}
    />
  );
}

function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { className, ...rest } = props;
  return (
    <label className={`font-semibold text-sm my-1 ${className}`} {...props} />
  );
}

export default function Page() {
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
  const [savedProof, setSavedProof] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !surname || !email || !phone) {
      console.error("You must fill all the fields.");
      setErrorMessage(
        "Devi compilare tutti i campi obbligatori, contrassegnati da un asterisco."
      );
      return;
    }

    if (!areTermsAgreed || !isPrivacyAgreed) {
      console.error("You must agree to the terms and conditions.");
      setErrorMessage("Devi accettare l'informativa sulla privacy .");
      return;
    }

    if (!isLoaded && !signUp) return null;

    if (!isPhoneValid(phone)) {
      setErrorMessage("Il numero di telefono non è valido.");
      return;
    }

    try {
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

      setSavedProof(document.getElementById("sign-up-form")?.innerHTML ?? "");
      // Set verifying to true to display second form and capture the OTP code
      setVerifying(true);
      setErrorMessage("");
    } catch (err) {
      console.log(err);
      let error = err as ClerkAPIResponseError;
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setErrorMessage(
        "C'è stato un errore nella registrazione: " +
          // @ts-ignore
          error.errors.map((e) => translateClerkAPIResponseText(e)).join(", ")
      );
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoaded && !signUp) return null;

    try {
      // Use the code provided by the user and attempt verification
      const signInAttempt = await signUp.attemptPhoneNumberVerification({
        code,
      });

      console.log("Sign in attempt:", signInAttempt);

      // If verification was completed, set the session to active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // Send data to iubenda
        await fetch("/api/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            first_name: name,
            last_name: surname,
            proofs: [
              {
                content: savedProof,
                type: "registration",
              },
            ],
          }),
        });
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signInAttempt);
        setErrorMessage("C'è stato un errore:" + signInAttempt.status);
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
      setErrorMessage("Errore durante l'invio del codice di verifica");
    }
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
              <h1 className="font-bold text-center text-xl my-2">
                Verifica il tuo numero di telefono
              </h1>
              <div
                className={`flex flex-col ${
                  errorMessage && !code ? "text-red-400" : ""
                }`}
              >
                <Label className="text-sm" htmlFor="codice">
                  Inserisci il codice di verifica inviato a {phone}
                </Label>
                <Input
                  type="text"
                  alt="codice di verifica"
                  name="codice"
                  value={code}
                  id="code"
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <p>
                <small className="text-red-400">{errorMessage}</small>
              </p>
              <button
                className="mx-auto p-2 bg-gray-800 text-white rounded-lg w-full my-2"
                type="submit"
              >
                Verifica
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
            <h1 className="font-bold text-center text-xl my-2">
              Crea un account
            </h1>
            <p className="font-light text-center text-sm my-1">
              Se hai già un account,{" "}
              <a href="/sign-in" className="underline">
                accedi
              </a>
              .
            </p>
            <div className="flex flex-row justify-start items-stretch my-2 gap-x-4 flex-wrap md:flex-nowrap">
              <div
                className={`flex flex-col items-stretch relative ${
                  errorMessage && !name ? "text-red-400" : ""
                }`}
              >
                <Label htmlFor="name">
                  Nome <span className="text-red-400">*</span>
                </Label>
                <Input
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
                <Label htmlFor="surname">
                  Cognome <span className="text-red-400">*</span>
                </Label>
                <Input
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
              <Label htmlFor="email">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
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
              <Label htmlFor="phone-num">
                Numero di telefono <span className="text-red-400">*</span>
              </Label>
              <PhoneInput
                inputClassName="w-full"
                defaultCountry="it"
                preferredCountries={["it", "us"]}
                value={phone}
                onChange={(p) => setPhone(p)}
              />
            </div>
            <div
              className={`flex flex-row items-center mt-6 ${
                errorMessage && !areTermsAgreed ? "text-red-400" : ""
              }`}
            >
              <input
                className="mr-2 w-4 h-4"
                type="checkbox"
                id="privacy"
                name="privacy"
                value="privacy"
                onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
              />
              <label htmlFor="terms" className="text-xs text-gray-700">
                Accetto l&apos;Informativa sulla Privacy{" "}
                <span className="text-red-400">*</span>
              </label>
            </div>
            <div
              className={`flex flex-row items-center ${
                errorMessage && !areTermsAgreed ? "text-red-400" : ""
              }`}
            >
              <div className="w-max">
                <input
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
              <label htmlFor="terms" className="text-xs text-gray-700">
                Accetto che i miei dati personali vengano elaborati e ceduti a
                terzi per scopi commerciali, come dettagliato nella Informativa
                sulla Privacy <span className="text-red-400">*</span>
              </label>
            </div>
            <p>
              <small
                className="text-red-400"
                dangerouslySetInnerHTML={{ __html: errorMessage }}
              ></small>
            </p>
            <button
              id="submit"
              className="mx-auto p-2 bg-gray-800 text-white rounded-lg w-full my-2"
              type="submit"
            >
              Registrati
            </button>
            <small>
              Cliccando sul pulsante &quot;Registrati&quot;, accetti la{" "}
              <a
                href="https://www.iubenda.com/privacy-policy/13243820"
                className="underline"
              >
                privacy policy
              </a>{" "}
              e la{" "}
              <a
                href="https://www.iubenda.com/privacy-policy/13243820/cookie-policy"
                className="underline"
              >
                cookie policy
              </a>
            </small>
          </form>
        </Container>
      </div>
    </>
  );
}
