"use client";

import { useUser } from "@/hooks/useUser";
import { Plan } from "@prisma/client";

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
    <section className="text-center w-full mx-auto bg-red-500">
      <h1 className="text-sm p-3 text-white">
        {props.children ?? props.content}
      </h1>
    </section>
  );
}
