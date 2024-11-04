import { scannerClient } from "@/lib/scannerClient";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [, setCardPayload] = useState<string | null>(null);

  useEffect(() => {
    const socket = scannerClient.ws.$ws();

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.event === "scan") {
        setCardPayload(message.payload);
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  return <Outlet />;
}
