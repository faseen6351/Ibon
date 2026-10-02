// Local crash-report helpers.
//
// Electron bundles Crashpad (Chromium's crash reporter). Once crashReporter.start() runs, Crashpad writes
// minidumps for every process and its handler prunes its own database (by default when it passes 128 MB
// or a report is older than 365 days), so Ibon does not re-implement capture or retention. All it needs is
// to find the dumps and tell the user where they are. Nothing in here uploads anything.
import fs from "node:fs";
import path from "node:path";

/** Finds .dmp files under `dir`, newest first. Crashpad's folder layout differs per OS, so this searches. */
export function listDumps(dir, maxDepth = 3) {
  const found = [];
  const walk = (current, depth) => {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (depth < maxDepth) walk(full, depth + 1);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".dmp")) {
        try {
          const st = fs.statSync(full);
          found.push({ path: full, bytes: st.size, time: st.mtimeMs });
        } catch {
          /* deleted while scanning */
        }
      }
    }
  };
  walk(dir, 0);
  return found.sort((a, b) => b.time - a.time);
}

export function summarizeDumps(dir) {
  const dumps = listDumps(dir);
  return {
    dir,
    count: dumps.length,
    bytes: dumps.reduce((total, d) => total + d.bytes, 0),
    latest: dumps[0]?.time ?? null,
  };
}
