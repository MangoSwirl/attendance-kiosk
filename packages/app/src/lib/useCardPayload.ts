import { create } from "zustand";

const useCardPayload = create<{
  cardPayload: string | null;
  setCardPayload: (cardPayload: string | null) => void;
}>((set) => ({
  cardPayload: null,
  setCardPayload: (cardPayload: string | null) => {
    set({ cardPayload });
  },
}));

export default useCardPayload;
