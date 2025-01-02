import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import * as pip from "./pip.js";
import type { WSContext } from "hono/ws";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

let ws: WSContext | undefined;

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

let isReaderConnected = false;

const wsRoute = app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onOpen(_event, wsContext) {
        ws = wsContext;
        ws?.send(
          JSON.stringify({
            event: "connectivity",
            connected: isReaderConnected,
          })
        );
      },
    };
  })
);

export type ScannerApp = typeof wsRoute;

try {
  pip.connect(
    (scanPayload) => {
      console.log(scanPayload);

      ws?.send(
        JSON.stringify({
          event: "scan",
          payload: scanPayload,
        })
      );
    },
    (newConnectivity) => {
      console.log("Is connected: " + newConnectivity);

      if (newConnectivity !== isReaderConnected) {
        isReaderConnected = newConnectivity;

        ws?.send(
          JSON.stringify({
            event: "connectivity",
            connected: isReaderConnected,
          })
        );
      }
    }
  );
} catch (error) {
  console.log(error);
}

if (process.env.NODE_ENV === "development") {
  app.post(
    "/scan",
    zValidator(
      "json",
      z.object({
        payload: z.string(),
      })
    ),
    async (c) => {
      const { payload } = c.req.valid("json");
      ws?.send(
        JSON.stringify({
          event: "scan",
          payload,
        })
      );

      return c.json({ status: "ok" });
    }
  );
}

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
