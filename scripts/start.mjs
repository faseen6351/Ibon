// Launches the built app (run `npm run build` first, or use `npm start`).
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const electronPath = createRequire(import.meta.url)("electron");
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE; // set by some editors' terminals; would run Electron as plain Node
spawn(electronPath, ["."], { stdio: "inherit", env }).on("exit", (c) => process.exit(c ?? 0));
