import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedQuizz - Test di medicina 2024",
  description:
    "Preparati con domande dalla banca ufficiale dati 2024: siamo i primi in Italia!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body
        className={
          inter.className +
          " h-full w-full bg-background relative flex flex-col"
        }
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
