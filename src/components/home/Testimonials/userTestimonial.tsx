type Props = {
  name: string;
  profileImageURL: string;
  testimonial: string;
  scorePercentage: number;
};

export function UserTestimonial(props: Props) {
  return (
    <div className="w-1/2">
      <div className="w-full bg-white rounded-lg p-4 border border-cardborder">
        <p className="text-md text-text-cta py-8">{props.testimonial}</p>
        <div className="mt-2 flex flex-row">
          <img
            src={props.profileImageURL}
            alt=""
            className="w-12 h-12 rounded-full"
          />
          <div className="ml-4 text-left">
            <h3 className="text-lg font-semibold">{props.name}</h3>
            <p className="text-md text-text-gray">
              Punteggio: {props.scorePercentage}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
