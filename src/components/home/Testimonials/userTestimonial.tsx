type Props = {
  name: string;
  profileImageURL: string;
  testimonial: string;
  score: number;
};

export function UserTestimonial(props: Props) {
  return (
    <div className="w-[376px] bg-white rounded-lg p-4 border border-cardborder">
      <p className="text-md text-text-cta py-8 h-[200px]">
        {props.testimonial}
      </p>
      <div className="mt-2 flex flex-row">
        <img
          src={props.profileImageURL}
          alt=""
          className="w-12 h-12 rounded-full"
        />
        <div className="ml-4 text-left">
          <h3 className="text-lg font-semibold">{props.name}</h3>
          <p className="text-md text-text-gray">Punteggio: {props.score}</p>
        </div>
      </div>
    </div>
  );
}
