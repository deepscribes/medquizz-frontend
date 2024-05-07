"use client";

import { Navbar } from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SearchParams = {
  r: number;
  t: number;
};

function calculateMinutes(start: string, end: any) {
  const s = parseInt(start);
  return Math.floor((end - s) / 60000);
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const { r, t } = searchParams;
  let start: string | null = localStorage!.getItem("start");
  if (!start) start = Date.now().toString();

  const router = useRouter();
  return (
    <>
      <Navbar isTesting={false} />
      <main>
        <div className="sm:hidden text-center my-6 max-w-4xl mx-auto px-8">
          <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border border-cardborder">
            <h1 className="text-2xl font-medium my-6">
              Congratulazioni! Hai totalizzato <br />
              <span className="font-extrabold">{r || 0}/90</span> in{" "}
              <span className="font-extrabold">
                {calculateMinutes(start, t) || 0} min 🎉
              </span>
            </h1>
            <div className="mx-auto w-full px-2">
              <img
                className="object-cover rounded-lg mx-auto sm:w-1/2"
                src="https://medquizz.s3.eu-south-1.amazonaws.com/Il-grande-Gatsby.webp"
                alt="Meme di Leonardo DiCaprio con il calice di vino nel film The Great Gatsby"
              />
            </div>
            <p className="text-center py-8 sm:w-1/2 mx-auto">
              Hai un&apos;idea o hai notato un problema? Parliamone su{" "}
              <a
                href="https://discord.gg/QQ7JpWFr5D"
                className="underline"
                target="_blank"
              >
                {" "}
                Discord
              </a>
              . Grazie per il tuo contributo e in bocca al lupo per i tuoi
              studi!
            </p>
            <div className="flex flex-row justify-between p-2">
              <button
                className="text-[#999999] sm:text-xl"
                onClick={() => {
                  localStorage.setItem("isReview", "true");
                  router.push("/test");
                }}
              >
                Rivedi test
              </button>
              <Link
                className="text-[#37B0FE] sm:text-xl font-bold"
                href="/"
                onClick={() => localStorage.clear()}
              >
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden sm:block text-center my-12 max-w-lg mx-auto">
          <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border border-cardborder mx-4">
            <h1 className="text-2xl font-semibold my-6">
              Congratulazioni! Hai totalizzato <br />
              <span className="font-extrabold">{r || 0}/90</span> in{" "}
              <span className="font-extrabold">
                {calculateMinutes(start, t) || 0} min 🎉
              </span>
            </h1>
            <img
              width={386}
              height={217}
              className="object-cover rounded-lg mx-auto"
              src="https://medquizz.s3.eu-south-1.amazonaws.com/Il-grande-Gatsby.webp"
              alt="Meme di Leonardo DiCaprio con il calice di vino nel film The Great Gatsby"
            />
            <p className="text-center py-6 px-12">
              Qualora volessi segnalarci una feature che vorresti o un bug,
              faccelo sapere tramite questo canale discord. Grazie e buona
              fortuna!
            </p>
            <div className="flex flex-row justify-between p-2">
              <button
                className="text-[#999999] text-xl"
                onClick={() => {
                  localStorage.setItem("isReview", "true");
                  router.push("/test");
                }}
              >
                Rivedi test
              </button>
              <Link
                className="text-[#37B0FE] text-xl font-bold"
                href="/"
                onClick={() => localStorage.clear()}
              >
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
