// The right-click menu for web pages. Electron shows nothing on right-click, so without this there is no
// "Open link in new tab", no "Copy link address" and, for a developer browser, no "Inspect".
//
// The set of items follows what Min's js/webviewMenu.js offers (links, images, selected text, editable fields,
// back/forward/reload, inspect element). This is a pure function from the click's details to a menu template,
// so what appears for each kind of click is unit-tested without a window.
//
// SPDX-License-Identifier: BSD-3-Clause

const isWebUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
const shorten = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/**
 * @param {object} params   Electron's context-menu params (linkURL, srcURL, mediaType, selectionText, isEditable, x, y)
 * @param {object} actions  what the items do: openTab(url), copyText(text), search(text), back(), forward(), reload(),
 *                          inspect(x, y), canGoBack, canGoForward, engineName
 * @returns {Array<object>} an Electron menu template
 */
export function buildContextMenuTemplate(params, actions) {
  const items = [];
  const group = (...entries) => {
    if (entries.length === 0) return;
    if (items.length > 0) items.push({ type: "separator" });
    items.push(...entries);
  };

  const link = isWebUrl(params.linkURL) ? params.linkURL : "";
  if (link) {
    group(
      { label: "Open link in new tab", click: () => actions.openTab(link) },
      { label: "Copy link address", click: () => actions.copyText(link) },
    );
  }

  const image = params.mediaType === "image" && isWebUrl(params.srcURL) ? params.srcURL : "";
  if (image) {
    group(
      { label: "Open image in new tab", click: () => actions.openTab(image) },
      { label: "Copy image address", click: () => actions.copyText(image) },
    );
  }

  const selection = String(params.selectionText ?? "").trim();
  if (params.isEditable) {
    group({ role: "cut" }, { role: "copy" }, { role: "paste" }, { type: "separator" }, { role: "selectAll" });
  } else if (selection) {
    group(
      { role: "copy" },
      { label: `Search ${actions.engineName ?? "the web"} for “${shorten(selection, 30)}”`, click: () => actions.search(selection) },
    );
  }

  if (!params.isEditable) {
    group(
      { label: "Back", enabled: Boolean(actions.canGoBack), click: () => actions.back() },
      { label: "Forward", enabled: Boolean(actions.canGoForward), click: () => actions.forward() },
      { label: "Reload", click: () => actions.reload() },
    );
  }

  group({ label: "Inspect", click: () => actions.inspect(params.x ?? 0, params.y ?? 0) });
  return items;
}
