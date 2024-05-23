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
import { OTPInput } from "@/components/ui/otpInput";

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
  const [isLoading, setIsLoading] = React.useState(false);
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

    setIsLoading(true);
    if (!isLoaded && !signIn) {
      setIsLoading(false);
      return null;
    }

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
        setIsLoading(false);
        router.push(`/risultati?r=${points}&t=${localStorage.getItem("end")}`);
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signInAttempt);
        setIsLoading(false);
        setErrorMessage("C'è stato un errore:" + signInAttempt.status);
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setErrorMessage("Codice di verifica invalido!");
      console.error("Error:", JSON.stringify(err, null, 2));
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
              <h1 className="font-bold text-center text-xl -my-2">Verifica</h1>
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
              <CTA type="submit" disabled={isLoading}>
                Verifica
              </CTA>
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
            <h1 className="font-bold text-center text-xl">Accedi a MedQuizz</h1>
            <p className="font-light text-center text-sm text-gray-500">
              Accedi per visualizzare il report completo con i quesiti
              commentati
            </p>
            <div
              className={`flex flex-col my-4 ${
                errorMessage && !phone ? "text-red-400" : ""
              }`}
            >
              <Label htmlFor="phone">Numero di telefono</Label>
              <PhoneInput
                required
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

            <p>
              <small className="text-red-400">{errorMessage}</small>
            </p>
            <CTA type="submit">Continua</CTA>
            <p className="font-light text-center text-sm mt-2">
              Non hai un account?{" "}
              <a href="/sign-up" className="text-primary-pressed font-semibold">
                Registrati
              </a>
              .
            </p>
          </form>
        </Container>
      </div>
    </>
  );
}
