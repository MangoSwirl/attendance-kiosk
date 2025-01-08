import { scannerClient } from "@/lib/scannerClient";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import useReaderConnected from "@/lib/readerConnected";
import useCardPayload from "@/lib/useCardPayload";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Route = createRootRoute({
  component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
  const setCardPayload = useCardPayload((state) => state.setCardPayload);
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
  }, [setReaderConnected, setCardPayload]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
