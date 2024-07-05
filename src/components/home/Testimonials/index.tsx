"use client";

import { profile } from "console";
import { Section } from "../section";
import { UserTestimonial } from "./userTestimonial";

const userData = [
  {
    name: "Mario Rossi",
    testimonial:
      "MedQuizz è la piattaforma più completa e semplice da usare che abbia mai provato. Grazie!",
    profileImageURL:
      "https://randomuser.me/apihttps://randomuser.me/api/portraits/thumb/men/75.jpg",
    scorePercentage: 90,
  },
  {
    name: "Luca Verdi",
    testimonial:
      "MedQuizz è la piattaforma più completa e semplice da usare che abbia mai provato. Grazie!",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/men/45.jpg",
    scorePercentage: 90,
  },
  {
    name: "Giuseppe Bianchi",
    testimonial:
      "MedQuizz è la piattaforma più completa e semplice da usare che abbia mai provato. Grazie!",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/men/85.jpg",
    scorePercentage: 90,
  },
];

export function Testimonials() {
  return (
    <Section mainText="Dicono di noi 😎 " smallText="Testimonials">
      <div className="flex items-center justify-center gap-8">
        {userData.map((user) => (
          <UserTestimonial
            key={user.name}
            name={user.name}
            testimonial={user.testimonial}
            scorePercentage={user.scorePercentage}
            profileImageURL={user.profileImageURL}
          />
        ))}
      </div>
    </Section>
  );
}
