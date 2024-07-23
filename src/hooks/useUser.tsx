"use client";
import { UserDataAPIResponse } from "@/app/api/userData/route";
import { APIResponse } from "@/types/APIResponses";
import { useAuth } from "@clerk/nextjs";
import { User } from "@prisma/client";
import {
  useContext,
  useEffect,
  useState,
  createContext,
  ReactNode,
} from "react";

type UserContextType = {
  user: User;
};

export const UserContext = createContext<{
  user: User | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
}>({ user: undefined, setUser: () => {} });

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): User | null | undefined {
  const { userId } = useAuth();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (!userId) {
      // Avoid useless API call if the user is not logged in
      setUser(null);
    } else if (!user) {
      fetch("/api/userData")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Errore nella richiesta");
          }
          return response.json();
        })
        .then((response: APIResponse<UserDataAPIResponse>) => {
          if (response.status === "error") {
            throw new Error("Errore nella richiesta");
          }
          return setUser(response.data.user);
        })
        .catch((e) => {
          console.error(e);
          setUser(null);
        });
    }
  }, [setUser, user, userId]);

  return user;
}
