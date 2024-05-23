export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={`border rounded-md border-gray-300 p-1 px-2 flex-1 ${className}`}
      {...rest}
    />
  );
}
