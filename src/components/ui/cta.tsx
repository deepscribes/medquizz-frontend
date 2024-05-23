import React from "react";

export function CTA(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={`mx-auto p-2 bg-gray-800 text-white rounded-md w-full ${className}`}
    >
      {props.children}
    </button>
  );
}
