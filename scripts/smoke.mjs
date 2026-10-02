// End-to-end smoke test of the real app. No test framework: it launches Ibon with a throwaway profile and a
// loopback-only debugging port, then drives it over the Chrome DevTools Protocol using Node built-ins.
//
//   npm run build && npm run smoke                       # unpackaged app
//   IBON_EXE=release/win-unpacked/Ibon.exe npm run smoke # a packaged build
//   SMOKE_OUT=./shots npm run smoke                      # also save screenshots
//
// Checks: the app starts, the UI renders, a crashed tab shows the recovery notice and leaves a local Crashpad
// report (never uploaded), Reload recovers it, and PDFs open in Chromium's built-in (PDFium) viewer.
import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shotDir = process.env.SMOKE_OUT ? path.resolve(process.env.SMOKE_OUT) : null;
if (shotDir) fs.mkdirSync(shotDir, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 20000, step = 300) {
  const end = Date.now() + ms;
  for (;;) {
    try {
      const v = await fn();
      if (v) return v;
    } catch {
      /* keep polling */
    }
    if (Date.now() > end) return null;
    await sleep(step);
  }
}
const freePort = () =>
  new Promise((resolve) => {
    const s = net.createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

function cdp(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.onopen = () =>
      resolve({
        send: (method, params = {}) =>
          new Promise((ok, ko) => {
            const i = ++id;
            pending.set(i, { ok, ko });
            ws.send(JSON.stringify({ id: i, method, params }));
          }),
        close: () => ws.close(),
      });
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) p.ko(new Error(m.error.message));
        else p.ok(m.result);
      }
    };
    ws.onerror = reject;
  });
}
const evaluate = async (c, expression) =>
  (await c.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
const shot = async (c, name) => {
  if (!shotDir) return;
  const r = await c.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(shotDir, name), Buffer.from(r.data, "base64"));
};

// A one-page PDF built by hand so the test needs no fixtures.
function makePdf(text) {
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
  ];
  const stream = `BT /F1 28 Tf 30 100 Td (${text}) Tj ET`;
  objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  let out = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}
const pdf = makePdf("Ibon smoke test PDF");
const server = http.createServer((req, res) => {
  if (req.url.endsWith(".pdf")) {
    res.writeHead(200, { "Content-Type": "application/pdf" });
    res.end(pdf);
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<!doctype html><title>Ibon smoke page</title><h1>hello</h1>");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const port = await freePort();
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ibon-smoke-"));
const args = [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`];
if (process.platform === "linux" && process.env.CI) args.push("--no-sandbox"); // CI containers cannot set up the SUID sandbox
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE; // set by some editors' terminals; would run Electron as plain Node
const exe = process.env.IBON_EXE ? path.resolve(process.env.IBON_EXE) : null;
const child = exe
  ? spawn(exe, args, { env, stdio: "ignore" })
  : spawn(createRequire(path.join(root, "package.json"))("electron"), [".", ...args], { cwd: root, env, stdio: "ignore" });
console.log(exe ? `Launching packaged build: ${exe}` : "Launching unpackaged app (npm run build first)");

const targets = async () => (await fetch(`http://127.0.0.1:${port}/json`)).json();
const samePath = (a, b) => path.resolve(a).toLowerCase().startsWith(path.resolve(b).toLowerCase());
let ui;
try {
  const uiTarget = await until(async () => (await targets()).find((t) => t.type === "page" && t.url.startsWith("file:")), 40000);
  check("app starts and the UI loads", Boolean(uiTarget));
  ui = await cdp(uiTarget.webSocketDebuggerUrl);
  check("brand mark renders", Boolean(await until(() => evaluate(ui, "(() => { const i = document.querySelector('img.brand'); return !!i && i.complete && i.naturalWidth > 0; })()"), 10000)));
  await shot(ui, "ui.png");

  await evaluate(ui, `window.ibon.invoke('tab:navigate', '${base}/page.html')`);
  const tab = await until(async () => (await targets()).find((t) => t.type === "page" && t.url.startsWith(base) && t.title === "Ibon smoke page"), 20000);
  check("a tab loads a page", Boolean(tab));

  // A page must not get the camera, microphone, location, notifications or clipboard contents without asking.
  // (Regression: Electron grants every permission request unless the app installs a handler.) This only reads
  // permission states and never opens a device.
  const probe = await cdp(tab.webSocketDebuggerUrl);
  const states = JSON.parse(
    await evaluate(
      probe,
      `(async () => {
        const out = {};
        for (const name of ['camera', 'microphone', 'geolocation', 'notifications', 'clipboard-read']) {
          try { out[name] = (await navigator.permissions.query({ name })).state; } catch { out[name] = 'unsupported'; }
        }
        out.notificationRequest = await Notification.requestPermission();
        return JSON.stringify(out);
      })()`,
    ),
  );
  probe.close();
  const granted = Object.entries(states).filter(([, v]) => v === "granted").map(([k]) => k);
  check("pages are denied camera, microphone, location, notifications and clipboard access", granted.length === 0, granted.length ? `granted without asking: ${granted.join(", ")}` : "none granted");

  const before = await evaluate(ui, "window.ibon.invoke('crash:info')");
  const tabSession = await cdp(tab.webSocketDebuggerUrl);
  tabSession.send("Page.crash").catch(() => {}); // kills this tab's renderer process on purpose
  const notice = await until(() => evaluate(ui, "document.querySelector('.crash h1')?.textContent || ''"), 20000);
  check("a crashed tab shows the recovery notice", notice === "This tab stopped working", notice || "no notice");
  check("the tab strip survives", (await evaluate(ui, "document.querySelectorAll('.tab').length")) >= 1);
  await shot(ui, "crash-notice.png");
  const info = await until(async () => {
    const i = await evaluate(ui, "window.ibon.invoke('crash:info')");
    return i.count > before.count ? i : null;
  }, 20000);
  check("Crashpad leaves a local crash report", Boolean(info), info ? `${info.count} report, ${info.bytes} bytes` : "none written");
  check("the report is kept inside the profile, nothing is uploaded", Boolean(info) && samePath(info.dir, profile), info?.dir);

  await evaluate(ui, "document.querySelector('.crash button')?.click()");
  check("Reload clears the notice", Boolean(await until(async () => (await evaluate(ui, "!document.querySelector('.crash')")) || null, 20000)));
  check("the page comes back", Boolean(await until(async () => (await targets()).find((t) => t.type === "page" && t.url.startsWith(base) && t.title === "Ibon smoke page"), 20000)));

  // The sidebar panels must survive being used. (Regression: an effect returning scrollIntoView()'s Promise
  // blanked the whole UI on Chromium 152 as soon as the Assistant re-rendered or unmounted.)
  const rootChildren = () => evaluate(ui, "document.getElementById('root').children.length");
  await evaluate(ui, "[...document.querySelectorAll('.pill')].find((b) => b.textContent.startsWith('Summarize'))?.click()");
  await sleep(2500); // no LLM is configured, so this ends in an error message; it must not take the UI down
  check("the Assistant survives a request", (await rootChildren()) > 0 && Boolean(await evaluate(ui, "!!document.querySelector('.assistant')")));
  await evaluate(ui, "[...document.querySelectorAll('.sidebar-tabs button')].find((b) => b.textContent === 'Dev tools').click()");
  await sleep(800);
  check("the Dev tools panel opens", Boolean(await evaluate(ui, "!!document.querySelector('.tools')")) && (await rootChildren()) > 0);
  await evaluate(ui, "[...document.querySelectorAll('.sidebar-tabs button')].find((b) => b.textContent === 'Settings').click()");
  await sleep(800);
  check("the Settings panel opens and shows diagnostics", Boolean(await until(() => evaluate(ui, "document.body.innerText.includes('Diagnostics') && document.body.innerText.includes('Ibon 0.')"), 8000)));
  await shot(ui, "settings.png");

  await evaluate(ui, `window.ibon.invoke('tab:navigate', '${base}/doc.pdf')`);
  const pdfTab = await until(async () => (await targets()).find((t) => t.url === `${base}/doc.pdf`), 20000);
  check("a PDF opens in a tab", Boolean(pdfTab));
  const viewer = await until(async () => (await targets()).find((t) => t.url.startsWith("chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai")), 20000);
  check("Chromium's built-in PDF viewer renders it", Boolean(viewer));
  if (pdfTab && shotDir) {
    const pc = await cdp(pdfTab.webSocketDebuggerUrl);
    await sleep(1500);
    await shot(pc, "pdf.png");
    pc.close();
  }
} catch (e) {
  check("smoke test ran without an error", false, String(e && e.message ? e.message : e));
} finally {
  try { ui?.close(); } catch { /* already closed */ }
  server.close();
  try {
    if (process.platform === "win32") execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" });
    else child.kill("SIGKILL");
  } catch { /* already gone */ }
  // Report first: tidying the profile must never hide the result (Windows can keep the folder locked for a moment).
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `\n${failed} of ${results.length} checks FAILED` : `\nall ${results.length} checks passed`);
  await sleep(500);
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch { /* leftover temp folder; the OS cleans it eventually */ }
  process.exit(failed ? 1 : 0);
}
