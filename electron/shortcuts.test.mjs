import { test } from "node:test";
import assert from "node:assert/strict";

import { matchShortcut } from "./shortcuts.mjs";

/** Builds an input like Electron's before-input-event: "ctrl+shift+t" -> { key: "t", control, shift }. */
function press(combo, extra = {}) {
  const parts = combo.split("+");
  let key = parts.pop();
  if (combo.endsWith("++")) key = "+"; // "ctrl++"
  const has = (m) => parts.includes(m);
  return { type: "keyDown", key, control: has("ctrl"), meta: has("meta"), shift: has("shift"), alt: has("alt"), isAutoRepeat: false, ...extra };
}

function expectAll(platform, rows) {
  for (const [combo, action] of rows) {
    assert.equal(matchShortcut(press(combo), platform), action, `${platform}: ${combo}`);
  }
}

test("Windows and Linux: tabs", () => {
  for (const platform of ["win32", "linux"]) {
    expectAll(platform, [
      ["ctrl+t", "new-tab"],
      ["ctrl+T", "new-tab"], // Caps Lock
      ["ctrl+w", "close-tab"],
      ["ctrl+shift+t", "reopen-tab"],
      ["ctrl+Tab", "next-tab"],
      ["ctrl+shift+Tab", "previous-tab"],
      ["ctrl+PageDown", "next-tab"],
      ["ctrl+PageUp", "previous-tab"],
      ["ctrl+1", "select-tab:1"],
      ["ctrl+8", "select-tab:8"],
      ["ctrl+9", "last-tab"],
    ]);
  }
});

test("Windows and Linux: address bar, navigation and page", () => {
  expectAll("win32", [
    ["ctrl+l", "focus-address"],
    ["alt+d", "focus-address"],
    ["F6", "focus-address"],
    ["alt+ArrowLeft", "back"],
    ["alt+ArrowRight", "forward"],
    ["ctrl+r", "reload"],
    ["F5", "reload"],
    ["ctrl+shift+r", "hard-reload"],
    ["ctrl+F5", "hard-reload"],
    ["ctrl+f", "find"],
    ["ctrl+=", "zoom-in"],
    ["ctrl++", "zoom-in"],
    ["ctrl+shift++", "zoom-in"],
    ["ctrl+-", "zoom-out"],
    ["ctrl+0", "zoom-reset"],
    ["ctrl+alt+r", "read-mode"],
    ["F12", "devtools"],
    ["ctrl+shift+I", "devtools"],
  ]);
});

test("macOS uses Cmd for the same actions", () => {
  expectAll("darwin", [
    ["meta+t", "new-tab"],
    ["meta+w", "close-tab"],
    ["meta+shift+t", "reopen-tab"],
    ["meta+l", "focus-address"],
    ["meta+f", "find"],
    ["meta+r", "reload"],
    ["meta+shift+r", "hard-reload"],
    ["meta+[", "back"],
    ["meta+]", "forward"],
    ["meta+alt+ArrowRight", "next-tab"],
    ["meta+alt+ArrowLeft", "previous-tab"],
    ["ctrl+Tab", "next-tab"],
    ["ctrl+shift+Tab", "previous-tab"],
    ["meta+3", "select-tab:3"],
    ["meta+9", "last-tab"],
    ["meta+alt+i", "devtools"],
    ["F12", "devtools"],
    ["meta+=", "zoom-in"],
    ["meta+-", "zoom-out"],
    ["meta+0", "zoom-reset"],
  ]);
});

test("the wrong modifier for the platform does nothing", () => {
  assert.equal(matchShortcut(press("meta+t"), "win32"), null, "the Windows key");
  assert.equal(matchShortcut(press("ctrl+t"), "darwin"), null, "Ctrl on a Mac");
  assert.equal(matchShortcut(press("ctrl+w"), "darwin"), null);
  assert.equal(matchShortcut(press("meta+ctrl+t"), "win32"), null);
});

test("Windows-only combinations are not claimed on macOS, and the reverse", () => {
  assert.equal(matchShortcut(press("alt+ArrowLeft"), "darwin"), null);
  assert.equal(matchShortcut(press("alt+d"), "darwin"), null);
  assert.equal(matchShortcut(press("ctrl+shift+i"), "darwin"), null);
  assert.equal(matchShortcut(press("meta+["), "win32"), null);
  assert.equal(matchShortcut(press("meta+alt+i"), "win32"), null);
});

test("ordinary typing is never a shortcut", () => {
  for (const key of ["t", "w", "l", "f", "r", "a", "1", "Tab", "Enter", "Escape", "ArrowLeft", "Backspace", " ", "+", "-", "="]) {
    assert.equal(matchShortcut({ type: "keyDown", key }, "win32"), null, key);
  }
});

test("combinations that are not claimed are left to the page", () => {
  for (const combo of ["ctrl+a", "ctrl+c", "ctrl+v", "ctrl+x", "ctrl+z", "ctrl+y", "ctrl+s", "ctrl+p", "ctrl+shift+w", "ctrl+alt+t", "alt+t", "shift+F5", "alt+F4", "ctrl+shift+l"]) {
    assert.equal(matchShortcut(press(combo), "win32"), null, combo);
  }
});

test("key release and held-down repeats are ignored", () => {
  assert.equal(matchShortcut(press("ctrl+t", { type: "keyUp" }), "win32"), null);
  assert.equal(matchShortcut(press("ctrl+t", { isAutoRepeat: true }), "win32"), null);
});

test("garbage input does not throw", () => {
  assert.equal(matchShortcut({}, "win32"), null);
  assert.equal(matchShortcut({ type: "keyDown" }, "win32"), null);
  assert.equal(matchShortcut({ type: "keyDown", key: 42 }, "win32"), null);
});
