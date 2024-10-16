"use client";

import * as React from "react";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full flex flex-row justify-center pt-10">
      <SignUp />
    </div>
  );
}
