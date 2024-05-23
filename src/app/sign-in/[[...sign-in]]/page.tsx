"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { PhoneCodeFactor, SignInFirstFactor } from "@clerk/types";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CTA } from "@/components/ui/cta";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { QuestionWithAnswers } from "@/lib/questions";
import { isPhoneValid } from "@/lib/phoneutils";

function getPoints(correctAnswers: number[], answers: number[]) {
  let res = 0;
  for (const answer of answers) {
    if (correctAnswers.includes(answer)) {
      res += 1.5;
    } else {
      res -= 0.4;
    }
  }
  return Math.round(res * 100) / 100;
}

export default function Page() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [verifying, setVerifying] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoaded && !signIn) return null;

    if (!isPhoneValid(phone)) {
      setErrorMessage("Numero di telefono non valido");
      return;
    }

    try {
      // Start the sign-in process using the phone number method
      const { supportedFirstFactors } = await signIn.create({
        identifier: phone,
      });

      // Filter the returned array to find the 'phone_code' entry
      const isPhoneCodeFactor = (
        factor: SignInFirstFactor
      ): factor is PhoneCodeFactor => {
        return factor.strategy === "phone_code";
      };
      const phoneCodeFactor = supportedFirstFactors?.find(isPhoneCodeFactor);

      if (phoneCodeFactor) {
        // Grab the phoneNumberId
        const { phoneNumberId } = phoneCodeFactor;

        // Send the OTP code to the user
        await signIn.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId,
        });

        // Set verifying to true to display second form
        // and capture the OTP code
        setVerifying(true);
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
      setErrorMessage("Errore durante l'invio del codice di verifica");
    }
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoaded && !signIn) return null;

    try {
      // Use the code provided by the user and attempt verification
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        if (!localStorage.getItem("start")) {
          router.push("/");
        }
        const questions: QuestionWithAnswers[] = JSON.parse(
          localStorage.getItem("questions") || ""
        );
        const correctAnswers = questions.map(
          (q) => q.answers.find((a) => a.isCorrect)?.id || 0
        );
        const points = getPoints(
          correctAnswers,
          Object.keys(localStorage)
            .filter((k) => k.startsWith("question-"))
            .map((k) => parseInt(localStorage.getItem(k)!))
        );
        if (!localStorage.getItem("end")) {
          localStorage.setItem("end", Date.now().toString());
        }
        router.push(`/risultati?r=${points}&t=${localStorage.getItem("end")}`);
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signInAttempt);
        setErrorMessage("C'è stato un errore:" + signInAttempt.status);
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setErrorMessage("Codice di verifica invalido!");
      console.error("Error:", JSON.stringify(err, null, 2));
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
              <h1 className="font-bold text-center text-xl my-2">Verifica</h1>
              <div
                className={`flex flex-col ${
                  errorMessage && !code ? "text-red-400" : ""
                }`}
              >
                <Label htmlFor="codice">
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
              <CTA type="submit">Vai</CTA>
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
            className="mx-auto flex flex-col gap-y-3"
          >
            <h1 className="font-bold text-center text-xl my-2">Accedi</h1>
            <p className="font-light text-center text-sm my-1">
              Se non hai un account,{" "}
              <a href="/sign-up" className="underline">
                registrati
              </a>
              .
            </p>
            <div
              className={`flex flex-col ${
                errorMessage && !phone ? "text-red-400" : ""
              }`}
            >
              <Label htmlFor="phone">Inserisci il numero di telefono</Label>
              <PhoneInput
                inputClassName="w-full"
                defaultCountry="it"
                preferredCountries={["it", "us"]}
                value={phone}
                onChange={(p) => setPhone(p)}
              />
            </div>

            <p>
              <small className="text-red-400">{errorMessage}</small>
            </p>
            <CTA type="submit">Vai</CTA>
          </form>
        </Container>
      </div>
    </>
  );
}
