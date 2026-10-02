// Per-site permission prompts for web content (camera, microphone, notifications).
//
// The rules follow Min's main/permissionManager.js (https://github.com/minbrowser/min, Apache-2.0, Min
// contributors): ask per site, an "Allow" lasts only for the current page, sub-frames are refused, and
// everything is revoked when the tab navigates or closes. This is a reimplementation, not a copy. Changes from
// Min: grants belong to one tab; media grants are merged, so camera plus microphone granted separately covers a
// later "both" request (a TODO in Min); a duplicate prompt is attached to the one already showing instead of
// being refused (also a Min TODO); and a "Block" is remembered until the page changes, so a site cannot nag.
//
// SPDX-License-Identifier: Apache-2.0
//
// No Electron imports here, so it can be unit-tested with Node's own runner.

/** Permissions a page may use without any prompt: low risk, and ordinary sites need them. */
const SILENT = new Set(["fullscreen", "clipboard-sanitized-write", "pointerLock"]);

/** Permissions Ibon can ask about. Everything else is refused (geolocation needs a Google API key in Electron). */
const PROMPTABLE = new Set(["media", "notifications"]);

/**
 * Chromium is inconsistent about the shape of an origin: a request carries a page URL, and a later check carries
 * "http://host:port/" with a trailing slash. Compare them all in one form, or a grant would never be found again.
 * Anything that is not a real web origin (about:blank, "null", garbage) becomes null and is refused.
 */
function normalizeOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const cleanTypes = (types) => [...new Set((types ?? []).filter((t) => t === "video" || t === "audio"))].sort();

export class PermissionManager {
  #pending = []; // { id, tabId, origin, permission, mediaTypes, responders: [fn] }
  #granted = []; // { tabId, origin, permission, mediaTypes }
  #blocked = new Set(); // `${tabId}|${origin}|${permission}`
  #nextId = 1;
  #onChange;

  /** @param {{ onChange?: () => void }} [options] */
  constructor({ onChange } = {}) {
    this.#onChange = onChange ?? (() => {});
  }

  /**
   * A page asked for a permission. `respond(true | false)` is called exactly once, now or after the user answers.
   * @param {{ tabId: number, origin: string | null, permission: string, mediaTypes?: string[], isMainFrame: boolean, respond: (allow: boolean) => void }} req
   */
  request({ tabId, origin: rawOrigin, permission, mediaTypes, isMainFrame, respond }) {
    if (SILENT.has(permission)) return respond(true);
    const origin = normalizeOrigin(rawOrigin);
    if (!isMainFrame || !origin || !PROMPTABLE.has(permission)) return respond(false);

    const types = permission === "media" ? cleanTypes(mediaTypes) : [];
    if (permission === "media" && types.length === 0) return respond(false);

    if (this.#blocked.has(this.#key(tabId, origin, permission))) return respond(false);
    if (this.#covered(tabId, origin, permission, types)) return respond(true);

    // The same question is already on screen: answer both with one click.
    const duplicate = this.#pending.find(
      (p) => p.tabId === tabId && p.origin === origin && p.permission === permission && sameSet(p.mediaTypes, types),
    );
    if (duplicate) {
      duplicate.responders.push(respond);
      return;
    }

    this.#pending.push({ id: this.#nextId++, tabId, origin, permission, mediaTypes: types, responders: [respond] });
    this.#onChange();
  }

  /**
   * Is this permission already granted? Chromium asks this separately from request(), sometimes with a single
   * media type and sometimes with none at all ("unknown"), straight after a grant.
   *
   * `tabId` is null when Chromium checks without a page attached, for example when it is about to show a
   * notification. Then the answer is by site: any open page of that origin holding the grant counts, which is
   * how Min does it too. The grant still ends when that page navigates away.
   */
  check({ tabId, origin: rawOrigin, permission, mediaType, isMainFrame, embeddingOrigin }) {
    if (SILENT.has(permission)) return true;
    const origin = normalizeOrigin(rawOrigin);
    if (!origin) return false;
    const forPage = tabId !== null && tabId !== undefined;
    if (forPage && !isMainFrame && normalizeOrigin(embeddingOrigin) !== origin) return false;
    const grants = this.#granted.filter((g) => g.origin === origin && g.permission === permission && (!forPage || g.tabId === tabId));
    if (grants.length === 0) return false;
    if (permission === "notifications") return true;
    if (permission !== "media") return false;
    if (mediaType === "audio" || mediaType === "video") return grants.some((g) => g.mediaTypes.includes(mediaType));
    return true; // no specific type: something was granted for this page
  }

  /** The user clicked Allow or Block on a pending request. */
  resolve(id, allow) {
    const i = this.#pending.findIndex((p) => p.id === id);
    if (i === -1) return;
    const [p] = this.#pending.splice(i, 1);
    if (allow) this.#grant(p);
    else this.#blocked.add(this.#key(p.tabId, p.origin, p.permission));
    this.#answer(p.responders, Boolean(allow));
    this.#onChange();
  }

  /** The tab navigated to a new page, closed, or crashed: refuse what is waiting and revoke what was granted. */
  forgetTab(tabId) {
    const waiting = this.#pending.filter((p) => p.tabId === tabId);
    const hadState = waiting.length > 0 || this.#granted.some((g) => g.tabId === tabId) || [...this.#blocked].some((k) => k.startsWith(`${tabId}|`));
    if (!hadState) return;
    this.#pending = this.#pending.filter((p) => p.tabId !== tabId);
    this.#granted = this.#granted.filter((g) => g.tabId !== tabId);
    this.#blocked = new Set([...this.#blocked].filter((k) => !k.startsWith(`${tabId}|`)));
    for (const p of waiting) this.#answer(p.responders, false);
    this.#onChange();
  }

  /** What the interface needs to draw: the questions waiting for an answer. */
  snapshot() {
    return this.#pending.map(({ id, tabId, origin, permission, mediaTypes }) => ({ id, tabId, origin, permission, mediaTypes }));
  }

  #key = (tabId, origin, permission) => `${tabId}|${origin}|${permission}`;

  #covered(tabId, origin, permission, types) {
    const grant = this.#granted.find((g) => g.tabId === tabId && g.origin === origin && g.permission === permission);
    if (!grant) return false;
    return permission !== "media" || types.every((t) => grant.mediaTypes.includes(t));
  }

  #grant({ tabId, origin, permission, mediaTypes }) {
    const existing = this.#granted.find((g) => g.tabId === tabId && g.origin === origin && g.permission === permission);
    if (existing) existing.mediaTypes = [...new Set([...existing.mediaTypes, ...mediaTypes])].sort();
    else this.#granted.push({ tabId, origin, permission, mediaTypes: [...mediaTypes] });
  }

  #answer(responders, allow) {
    for (const respond of responders) {
      try {
        respond(allow);
      } catch {
        /* the frame is already gone; nothing left to tell */
      }
    }
  }
}
