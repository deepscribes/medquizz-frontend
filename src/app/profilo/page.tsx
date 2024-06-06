"use client";

import { useUser } from "@clerk/clerk-react";
import { Navbar } from "@/components/navbar";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return null;
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Ciao {user.firstName}, ecco il tuo andamento
        </h1>
      </div>
    </>
  );
}
