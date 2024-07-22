import { HTMLProps } from "react";

export function Modal(
  props: Partial<HTMLProps<HTMLDivElement>> & { children: React.ReactNode }
) {
  const { children, ...rest } = props;
  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center pointer-events-auto"
      {...rest}
    >
      <div className="bg-white p-8 rounded-xl border border-cardborder">
        {props.children}
      </div>
    </div>
  );
}
