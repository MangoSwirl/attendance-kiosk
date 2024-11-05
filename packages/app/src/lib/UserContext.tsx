import { createContext, useContext } from "react";

type User = {
  id: string;
  name: string;
};

export const UserContext = createContext<{
  cardPayload: string | null;
  user: User | null;
}>({
  cardPayload: null,
  user: null,
});

export function useUser() {
  return useContext(UserContext);
}
