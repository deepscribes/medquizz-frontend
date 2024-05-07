"use client";

import { Navbar } from "@/components/navbar";
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
        <div className="text-center my-12 max-w-lg mx-auto">
          <div className="flex flex-col space-y-4 bg-white p-4 pt-8 rounded-2xl border boder-[#B3B3B3]">
            <h1 className="text-2xl font-medium my-6">
              Congratulazioni! Hai totalizzato <br />
              <span className="font-extrabold">{r || 0}/90</span> in{" "}
              <span className="font-extrabold">
                {calculateMinutes(start, t) || 0} {" "}min 🎉
              </span>
              
            </h1>
            <img
              width={386}
              height={217}
              className="object-cover rounded-lg mx-auto"
              src="https://miro.medium.com/v2/resize:fit:1186/1*vMfasJsJ3TahSelTj4BzkA.jpeg"
              alt="Meme di Leonardo DiCaprio con il calice di vino nel film The Great Gatsby"
            />
            <p className="text-center py-6 px-12">
            Hai un'idea o hai notato un problema? Parliamone su{" "}<a href="https://discord.gg/QQ7JpWFr5D" className="underline" target="_blank"> Discord</a>.{" "}Grazie per il tuo contributo e in bocca al lupo per i tuoi studi!
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
