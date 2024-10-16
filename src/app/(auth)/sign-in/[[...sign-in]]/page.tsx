"use client";

import * as React from "react";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full flex flex-row justify-center pt-10">
      <SignIn />
    </div>
  );
}
