import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";
import { CorrectAnswersProvider } from "@/hooks/useCorrectAnswers";
import "./globals.css";
import { ReviewContextProvider } from "@/hooks/useReview";
import { UserContextProvider } from "@/hooks/useUser";
import { PostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedQuizz - Test di medicina 2024",
  description:
    "Preparati con domande dalla banca ufficiale dati 2024: siamo i primi in Italia!",
  authors: [
    {
      name: "Giuseppe Granatiero",
      url: "https://linkedin.com/in/giuseppegranatiero",
    },
    {
      name: "Nicola Migone",
      url: "https://linkedin.com/in/nicola-migone",
    },
  ],
  keywords: ["medicina", "test", "2024", "quiz", "banca dati"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={itIT}>
      <html lang="it" className="w-full h-max">
        <head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#2d89ef" />
          <meta name="theme-color" content="#ffffff" />
        </head>
        <body
          className={
            inter.className +
            " h-full w-full bg-background relative flex flex-col"
          }
        >
          <CorrectAnswersProvider>
            <ReviewContextProvider>
              <UserContextProvider>
                <PostHogProvider>{children}</PostHogProvider>
              </UserContextProvider>
            </ReviewContextProvider>
          </CorrectAnswersProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
