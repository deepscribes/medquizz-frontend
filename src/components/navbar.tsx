"use client";

export function Navbar() {
  return (
    <>
      <nav className="flex items-center justify-between w-full p-5 bg-white text-gray-800 shadow-md">
        <a href="/" className="text-2xl font-bold">
          🩺 MedQuizz
        </a>
        <div className="flex items-center space-x-4 font-bold text-[#414288]">
          <a href="" onClick={() => alert("Not implemented!")}>
            Unisciti alla community!
          </a>
        </div>
      </nav>
    </>
  );
}
