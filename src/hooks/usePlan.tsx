"use client";
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
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      fetch("/api/userData")
        .then((response) => response.json())
        .then((data) => setUser(data.user));
    }
  }, []);

  return user;
}
