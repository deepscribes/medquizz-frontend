"use client";

import { useUser } from "@/hooks/useUser";
import { Plan } from "@/types/db";

type BannerProps = {
  content?: string | React.ReactNode;
  children?: React.ReactNode;
};

export function Banner(props: BannerProps) {
  const user = useUser();

  if (user && user.plan !== Plan.BASIC) {
    return null;
  }

  return (
    <section className="sticky top-0 z-50 text-center w-full mx-auto bg-red-500">
      <h1 className="text-sm p-3 text-white">
        {props.children ?? props.content}
      </h1>
    </section>
  );
}
