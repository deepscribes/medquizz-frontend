export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { className, ...rest } = props;
  return (
    <label className={`font-medium text-sm my-1 ${className}`} {...rest} />
  );
}
