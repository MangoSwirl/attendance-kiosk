import { create } from "zustand";

const useReaderConnected = create<{
  readerConnected: boolean;
  setReaderConnected: (readerConnected: boolean) => void;
}>((set) => ({
  readerConnected: false,
  setReaderConnected: (readerConnected: boolean) => {
    set({ readerConnected });
  },
}));

export default useReaderConnected;
