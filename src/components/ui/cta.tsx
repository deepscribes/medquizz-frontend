import React from "react";

export function CTA(props: React.ButtonHTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={`mx-auto p-2 bg-primary text-white rounded-md w-full ${className}`}
      {...rest}
    >
      {props.children}
    </div>
  );
}
