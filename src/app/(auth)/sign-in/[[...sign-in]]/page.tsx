"use client";

import * as React from "react";
import { SignIn } from "@clerk/nextjs";
import { Container } from "@/components/ui/container";

export default function Page() {
  return (
    <Container className="max-w-none">
      <SignIn />
    </Container>
  );
}
