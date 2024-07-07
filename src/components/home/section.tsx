type Props = {
  mainText: string;
  smallText?: string;
  children?: React.ReactNode;
  id?: string;
};

export function Section(props: Props) {
  return (
    <section className="text-center mt-32" id={props.id}>
      <small className="text-text-lightblue font-semibold text-lg">
        {props.smallText}
      </small>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 mt-2 text-text-cta">
        {props.mainText}
      </h1>
      {props.children}
    </section>
  );
}
