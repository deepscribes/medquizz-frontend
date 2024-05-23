export function Container(
  props: React.HTMLAttributes<HTMLElement> & {
    children: React.ReactNode;
  }
) {
  const { className, ...rest } = props;
  return (
    <div
      {...rest}
      className={`flex flex-col items-center justify-center w-full bg-white max-w-xl mx-auto p-8 rounded-2xl border-cardborder border ${className}`}
    >
      {props.children}
    </div>
  );
}
