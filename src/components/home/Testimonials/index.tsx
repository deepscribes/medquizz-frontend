"use client";

import { useEffect } from "react";
import { UserTestimonial } from "./userTestimonial";
import ScrollCarousel from "scroll-carousel";

const userData = [
  {
    name: "Marta",
    testimonial:
      "“Medquizz mi ha salvato la vita, mai trovato un simulatore come questo, davvero completo e super intuitivo da utilizzare, grazie mille”",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/women/34.jpg",
    score: 88.6,
  },
  {
    name: "Luca",
    testimonial:
      "“L'interfaccia di MedQuizz è intuitiva e la personalizzazione dei quiz mi ha permesso di concentrarmi sulle mie lacune. È lo strumento ideale per prepararsi al test di medicina.”",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/men/35.jpg",
    score: 90,
  },
  {
    name: "Beatrice",
    testimonial:
      "“La rapidità con cui MedQuizz hanno aggiornato la banca dati è impressionante. Segnalazioni di errori o refusi vengono risolte velocemente, migliorando costantemente la qualità dei quesiti.”",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/women/57.jpg",
    score: 87.2,
  },
  {
    name: "Marta",
    testimonial:
      "“Medquizz mi ha salvato la vita, mai trovato un simulatore come questo, davvero completo e super intuitivo da utilizzare, grazie mille”",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/women/34.jpg",
    score: 88.6,
  },
  {
    name: "Luca",
    testimonial:
      "“L'interfaccia di MedQuizz è intuitiva e la personalizzazione dei quiz mi ha permesso di concentrarmi sulle mie lacune. È lo strumento ideale per prepararsi al test di medicina.”",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/men/35.jpg",
    score: 90,
  },
  {
    name: "Beatrice",
    testimonial:
      "“La rapidità con cui MedQuizz hanno aggiornato la banca dati è impressionante. Segnalazioni di errori o refusi vengono risolte velocemente, migliorando costantemente la qualità dei quesiti.”",
    profileImageURL: "https://randomuser.me/api/portraits/thumb/women/57.jpg",
    score: 87.2,
  },
] as const;

export default function Testimonials() {
  useEffect(() => {
    if (typeof document === undefined) return;
    const scrollCarousel = new ScrollCarousel("#testimonials-carousel", {
      autoplay: true,
      speed: 3,
      smartSpeed: true,
    });

    return () => {
      scrollCarousel.destroy();
    };
  }, []);
  return (
    <div className="w-full">
      <div id="testimonials-carousel">
        {userData.map((user, i) => (
          <UserTestimonial
            key={i}
            name={user.name}
            testimonial={user.testimonial}
            score={user.score}
            profileImageURL={user.profileImageURL}
          />
        ))}
      </div>
    </div>
  );
}
