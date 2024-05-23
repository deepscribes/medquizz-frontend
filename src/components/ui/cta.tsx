import React from "react";

export function CTA(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      className={`mx-auto p-2 bg-primary text-white rounded-md w-full ${className}`}
      {...rest}
    >
      {props.children}
    </button>
  );
}
