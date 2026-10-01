// Starts the Vite dev server, then launches Electron pointed at it.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "vite";

const require = createRequire(import.meta.url);
const electronPath = require("electron");

const server = await createServer();
await server.listen();
const url = server.resolvedUrls?.local?.[0] ?? "http://localhost:5173/";

const app = spawn(electronPath, ["."], {
  stdio: "inherit",
  env: (() => { const e = { ...process.env, IBON_DEV_URL: url }; delete e.ELECTRON_RUN_AS_NODE; return e; })(),
});
app.on("exit", async (code) => {
  await server.close();
  process.exit(code ?? 0);
});
