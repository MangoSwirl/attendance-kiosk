import { hc } from "hono/client";
import type { ScannerApp } from "@attendance-kiosk/scanner/src/index";

export const scannerClient = hc<ScannerApp>("http://localhost:3000");
