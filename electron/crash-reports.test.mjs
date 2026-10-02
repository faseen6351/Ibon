import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { listDumps, summarizeDumps } from "./crash-reports.mjs";

function makeTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ibon-crash-"));
  fs.mkdirSync(path.join(root, "reports"));
  fs.mkdirSync(path.join(root, "pending", "nested"), { recursive: true });
  fs.writeFileSync(path.join(root, "reports", "a.dmp"), Buffer.alloc(100));
  fs.writeFileSync(path.join(root, "pending", "nested", "B.DMP"), Buffer.alloc(50));
  fs.writeFileSync(path.join(root, "settings.dat"), "not a dump");
  fs.writeFileSync(path.join(root, "reports", "notes.txt"), "not a dump");
  // make a.dmp older so ordering is deterministic
  const old = new Date(Date.now() - 60_000);
  fs.utimesSync(path.join(root, "reports", "a.dmp"), old, old);
  return root;
}

test("finds .dmp files in any Crashpad layout, ignoring other files", () => {
  const root = makeTree();
  const dumps = listDumps(root);
  assert.equal(dumps.length, 2);
  assert.deepEqual(dumps.map((d) => path.basename(d.path)), ["B.DMP", "a.dmp"], "newest first");
  fs.rmSync(root, { recursive: true, force: true });
});

test("summarizes count, size and latest time", () => {
  const root = makeTree();
  const s = summarizeDumps(root);
  assert.equal(s.dir, root);
  assert.equal(s.count, 2);
  assert.equal(s.bytes, 150);
  assert.ok(typeof s.latest === "number");
  fs.rmSync(root, { recursive: true, force: true });
});

test("a missing folder means no crash reports, not an error", () => {
  const s = summarizeDumps(path.join(os.tmpdir(), "ibon-does-not-exist-" + Date.now()));
  assert.equal(s.count, 0);
  assert.equal(s.bytes, 0);
  assert.equal(s.latest, null);
});

test("does not descend past maxDepth", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ibon-crash-"));
  const deep = path.join(root, "a", "b", "c", "d");
  fs.mkdirSync(deep, { recursive: true });
  fs.writeFileSync(path.join(deep, "deep.dmp"), Buffer.alloc(1));
  assert.equal(listDumps(root, 3).length, 0);
  assert.equal(listDumps(root, 4).length, 1);
  fs.rmSync(root, { recursive: true, force: true });
});
