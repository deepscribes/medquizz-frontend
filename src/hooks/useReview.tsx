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

function reviewTypeToString(review: ReviewType): string {
  switch (review) {
    case ReviewType.False:
      return "false";
    case ReviewType.DuringTest:
      return "during";
    case ReviewType.AfterTest:
      return "after";
  }
}

function stringToReviewType(review: string): ReviewType {
  switch (review) {
    case "false":
      return ReviewType.False;
    case "during":
      return ReviewType.DuringTest;
    case "after":
      return ReviewType.AfterTest;
    default:
      return ReviewType.False;
  }
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

  useEffect(() => {
    const review = localStorage.getItem("review");
    if (review) {
      setReview(stringToReviewType(review));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("review", reviewTypeToString(review));
  }, [review]);

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
