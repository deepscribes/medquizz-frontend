export function Container(
  props: React.HTMLAttributes<HTMLElement> & {
    children: React.ReactNode;
  }
) {
  const { className, ...rest } = props;
  return (
    <div
      {...rest}
      className={`flex flex-col items-center justify-center w-full max-w-96 py-8 m-8 ${className}`}
    >
      <div className="mx-auto bg-white p-8 border-cardborder border rounded-2xl">
        {props.children}
      </div>
    </div>
  );
}
