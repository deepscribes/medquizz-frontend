export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={`border rounded-md border-gray-300 p-1 px-2 flex-1 focus-visible:outline-none focus-within:shadow-black focus-within:shadow-sm ${className}`}
      {...rest}
    />
  );
}
