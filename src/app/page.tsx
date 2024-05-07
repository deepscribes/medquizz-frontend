"use client";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-3/4 flex-grow mx-auto">
        <div className="text-center my-12">
          <p className="uppercase font-semibold text-[#6EA6E1]">
            TEST MEDICINA 2024
          </p>
          <h1 className="text-5xl font-extrabold m-8 text-cta">
            🚀 Simulazioni Illimitate e gratuite su MedQuizz
          </h1>
          <h2 className="text-xl max-w-md mx-auto text-cta">
            Preparati con la banca ufficiale: siamo i primi in Italia!
          </h2>
        </div>
        <div className="w-full flex items-center justify-center my-24">
          <a
            className="mx-auto text-xl font-semibold p-4 bg-primary text-white rounded-lg relative"
            href="/test"
            onClick={() => {
              localStorage.clear();
              localStorage.setItem("start", Date.now().toString());
            }}
          >
            👉 Esercitati gratis!
            <div className="w-full h-full bg-secondary rounded-lg absolute top-2 left-2 -z-10"></div>
          </a>
        </div>
        <img
          className="max-w-xl h-60 mx-auto my-12 object-cover rounded-lg shadow-xl"
          src="https://media.discordapp.net/attachments/1236790475290181733/1237225177842974760/image.png?ex=663adf3c&is=66398dbc&hm=635b7936ab0ed751efe2b18005c67dc893caa0e37f86cc9a92c14276e4617973&=&format=webp&quality=lossless&width=1100&height=590"
        />
      </main>
      <p className="font-extrabold text-center bottom-0 p-8 text-cta">
        Sviluppato dal team di{" "}
        <a
          href="https://www.deepscribes.com"
          className="underline"
          target="_blank"
        >
          Deepscribes
        </a>
      </p>
    </>
  );
}
