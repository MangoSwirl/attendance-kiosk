import { scannerClient } from "@/lib/scannerClient";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserContext } from "../lib/UserContext";
import useReaderConnected from "@/lib/readerConnected";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [cardPayload, setCardPayload] = useState<string | null>(null);
  const setReaderConnected = useReaderConnected((state) => state.setReaderConnected);

  useEffect(() => {
    const socket = scannerClient.ws.$ws();

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.event === "scan") {
        setCardPayload(message.payload);
      }

      if (message.event === "connectivity") {
        setReaderConnected(message.connected);
      }
    });

    return () => {
      socket.close();
    };
  }, [setReaderConnected]);

  return (
    <UserContext.Provider
      value={{
        cardPayload,
        user: null,
      }}
    >
      <Outlet />
    </UserContext.Provider>
  );
}
