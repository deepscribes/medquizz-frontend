"use client";

type Props = Partial<HTMLElement> & {
  isTesting?: boolean;
};

export function Navbar(props: Props) {
  return (
    <>
      <nav className="flex items-center justify-between w-full p-5 bg-white text-gray-800 shadow-md">
        <a href="/" className="text-2xl font-bold">
          🩺 MedQuizz
        </a>
        {props.isTesting ? (
          <div className="flex flex-row gap-x-4">
            <button className="px-6 py-3 rounded-md border border-primary text-primary font-semibold">
              Chiudi
            </button>
            <div className="w-full flex items-center justify-center relative">
              <button className="mx-auto font-semibold p-3 px-8 bg-primary text-white rounded-lg relative z-20">
                Consegna
              </button>
              <div className="w-full h-full bg-secondary rounded-lg absolute top-2 left-2 z-10"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4 font-bold text-[#414288]">
            <a href="" onClick={() => alert("Not implemented!")}>
              Unisciti alla community!
            </a>
          </div>
        )}
      </nav>
    </>
  );
}
