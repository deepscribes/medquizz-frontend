"use client";
import {
  useContext,
  useState,
  createContext,
  ReactNode,
  useEffect,
} from "react";

export enum ReviewType {
  False,
  DuringTest,
  AfterTest,
}

export const ReviewContext = createContext<{
  review: ReviewType;
  setReview: React.Dispatch<React.SetStateAction<ReviewType>>;
}>({ review: ReviewType.False, setReview: () => {} });

export const ReviewContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [review, setReview] = useState<ReviewType>(ReviewType.False);

  return (
    <ReviewContext.Provider value={{ review, setReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export function useReview(): {
  review: ReviewType;
  setReview: React.Dispatch<React.SetStateAction<ReviewType>>;
} {
  return useContext(ReviewContext);
}
