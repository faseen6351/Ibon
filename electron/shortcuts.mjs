// Keyboard shortcuts: which key combination means which browser action.
//
// The set follows what browsers (and Min's js/defaultKeybindings.js) have taught people: Ctrl/Cmd+T new tab,
// +W close, +L address bar, +F find, Ctrl+Tab next tab, Alt+Left back, F12 developer tools, and so on. This is a pure
// function of the key event, so every combination is unit-tested without starting Electron.
//
// "mod" is Cmd on macOS and Ctrl elsewhere. Combinations that use the OTHER modifier are ignored, so for example the
// Windows key never triggers a shortcut by accident.
//
// SPDX-License-Identifier: BSD-3-Clause

/**
 * @param {{ type?: string, key: string, control?: boolean, meta?: boolean, shift?: boolean, alt?: boolean, isAutoRepeat?: boolean }} input
 *   An Electron `before-input-event` input.
 * @param {string} [platform]  `process.platform`
 * @returns {string | null} an action name, or null when the key is not a shortcut
 */
export function matchShortcut(input, platform = process.platform) {
  if (input.type !== "keyDown" || input.isAutoRepeat || typeof input.key !== "string") return null;
  const mac = platform === "darwin";
  const mod = Boolean(mac ? input.meta : input.control);
  const wrongMod = Boolean(mac ? input.control : input.meta);
  const shift = Boolean(input.shift);
  const alt = Boolean(input.alt);
  if (wrongMod && !(input.control && input.key === "Tab")) return null; // Ctrl+Tab cycles tabs on every platform
  const key = input.key.length === 1 ? input.key.toLowerCase() : input.key;

  // ---- Tabs
  if (mod && !alt && !shift && key === "t") return "new-tab";
  if (mod && !alt && shift && key === "t") return "reopen-tab";
  if (mod && !alt && !shift && key === "w") return "close-tab";
  if (input.control && !alt && key === "Tab") return shift ? "previous-tab" : "next-tab";
  if (!mac && input.control && !alt && !shift && key === "PageDown") return "next-tab";
  if (!mac && input.control && !alt && !shift && key === "PageUp") return "previous-tab";
  if (mac && input.meta && alt && !shift && key === "ArrowRight") return "next-tab";
  if (mac && input.meta && alt && !shift && key === "ArrowLeft") return "previous-tab";
  if (mod && !alt && !shift && /^[1-9]$/.test(key)) return key === "9" ? "last-tab" : `select-tab:${key}`;

  // ---- Address bar and navigation
  if (mod && !alt && !shift && key === "l") return "focus-address";
  if (!mac && alt && !mod && !shift && key === "d") return "focus-address";
  if (!mod && !alt && !shift && key === "F6") return "focus-address";
  if (!mac && alt && !mod && !shift && key === "ArrowLeft") return "back";
  if (!mac && alt && !mod && !shift && key === "ArrowRight") return "forward";
  if (mac && mod && !alt && !shift && key === "[") return "back";
  if (mac && mod && !alt && !shift && key === "]") return "forward";
  if (mod && !alt && !shift && key === "r") return "reload";
  if (!mod && !alt && !shift && key === "F5") return "reload";
  if (mod && !alt && shift && key === "r") return "hard-reload";
  if (!mac && input.control && !alt && !shift && key === "F5") return "hard-reload";

  // ---- Page
  if (mod && !alt && !shift && key === "f") return "find";
  if (mod && !alt && !shift && (key === "=" || key === "+")) return "zoom-in";
  if (mod && !alt && shift && key === "+") return "zoom-in"; // Ctrl+Shift+= on many layouts
  if (mod && !alt && (key === "-" || key === "_")) return "zoom-out";
  if (mod && !alt && !shift && key === "0") return "zoom-reset";
  if (mod && alt && !shift && key === "r") return "read-mode";

  // ---- Developer tools
  if (!mod && !alt && !shift && key === "F12") return "devtools";
  if (!mac && mod && !alt && shift && key === "i") return "devtools";
  if (mac && mod && alt && !shift && key === "i") return "devtools";

  return null;
}

/** The shortcuts, for a help overlay or the README. Kept next to the matcher so they cannot drift apart. */
export const SHORTCUT_HELP = [
  ["New tab", "Ctrl/Cmd+T"],
  ["Close tab", "Ctrl/Cmd+W"],
  ["Reopen closed tab", "Ctrl/Cmd+Shift+T"],
  ["Next / previous tab", "Ctrl+Tab / Ctrl+Shift+Tab"],
  ["Go to tab 1–8, last tab", "Ctrl/Cmd+1–8, Ctrl/Cmd+9"],
  ["Address bar", "Ctrl/Cmd+L, F6"],
  ["Back / forward", "Alt+Left / Alt+Right (Cmd+[ / Cmd+] on Mac)"],
  ["Reload / hard reload", "Ctrl/Cmd+R, F5 / Ctrl/Cmd+Shift+R"],
  ["Find in page", "Ctrl/Cmd+F"],
  ["Zoom in / out / reset", "Ctrl/Cmd+= / Ctrl/Cmd+- / Ctrl/Cmd+0"],
  ["Read mode", "Ctrl/Cmd+Alt+R"],
  ["Developer tools", "F12, Ctrl+Shift+I (Cmd+Alt+I on Mac)"],
];
