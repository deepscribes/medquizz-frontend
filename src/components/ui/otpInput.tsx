import VerificationInput from "react-verification-input";

export function OTPInput(props: {
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <VerificationInput
      value={props.value}
      onChange={(e) => props.onChange(e)}
      classNames={{
        container: "my-6",
        character: "rounded-md",
      }}
      placeholder=""
    />
  );
}
