import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import * as pip from "./pip.js";
import type { WSContext } from "hono/ws";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

let ws: WSContext | undefined;

const reader = pip.connect((frame) => {
  console.log(frame.commandByte);
});

const { upgradeWebSocket } = createNodeWebSocket({ app });

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(_event, wsContext) {
        ws = wsContext;
      },
    };
  })
);

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
    }
  );
}

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
