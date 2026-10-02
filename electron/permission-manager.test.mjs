import { test } from "node:test";
import assert from "node:assert/strict";

import { PermissionManager } from "./permission-manager.mjs";

const SITE = "https://meet.example.com";

function setup() {
  let changes = 0;
  const pm = new PermissionManager({ onChange: () => changes++ });
  const answers = [];
  const ask = (over = {}) => {
    const log = { value: undefined, calls: 0 };
    answers.push(log);
    pm.request({
      tabId: 1,
      origin: SITE,
      permission: "media",
      mediaTypes: ["video", "audio"],
      isMainFrame: true,
      respond: (v) => {
        log.value = v;
        log.calls++;
      },
      ...over,
    });
    return log;
  };
  return { pm, ask, changes: () => changes };
}

test("low-risk permissions are allowed without a prompt", () => {
  const { pm, ask } = setup();
  for (const permission of ["fullscreen", "clipboard-sanitized-write", "pointerLock"]) {
    assert.equal(ask({ permission, mediaTypes: undefined }).value, true, permission);
  }
  assert.equal(pm.snapshot().length, 0);
});

test("anything Ibon cannot ask about is refused, with no prompt", () => {
  const { pm, ask } = setup();
  for (const permission of ["geolocation", "clipboard-read", "display-capture", "midi", "openExternal", "usb", "unknown"]) {
    assert.equal(ask({ permission, mediaTypes: undefined }).value, false, permission);
  }
  assert.equal(pm.snapshot().length, 0);
});

test("sub-frames, opaque origins and empty media requests are refused", () => {
  const { pm, ask } = setup();
  assert.equal(ask({ isMainFrame: false }).value, false);
  assert.equal(ask({ origin: null }).value, false);
  assert.equal(ask({ origin: "null" }).value, false);
  assert.equal(ask({ mediaTypes: [] }).value, false);
  assert.equal(pm.snapshot().length, 0);
});

test("a camera and microphone request waits for the user, then Allow grants it once", () => {
  const { pm, ask, changes } = setup();
  const a = ask();
  assert.equal(a.value, undefined, "nothing is decided before the user answers");
  assert.equal(changes(), 1);
  const [req] = pm.snapshot();
  assert.deepEqual({ ...req, id: undefined }, { id: undefined, tabId: 1, origin: SITE, permission: "media", mediaTypes: ["audio", "video"] });

  pm.resolve(req.id, true);
  assert.equal(a.value, true);
  assert.equal(a.calls, 1);
  assert.equal(pm.snapshot().length, 0);
  assert.equal(pm.check({ tabId: 1, origin: SITE, permission: "media", mediaType: "video", isMainFrame: true }), true);
  assert.equal(pm.check({ tabId: 1, origin: SITE, permission: "media", mediaType: "audio", isMainFrame: true }), true);
  assert.equal(pm.check({ tabId: 1, origin: SITE, permission: "media", mediaType: "unknown", isMainFrame: true }), true);
});

test("a grant is for one tab and one origin only", () => {
  const { pm, ask } = setup();
  ask();
  pm.resolve(pm.snapshot()[0].id, true);
  const base = { permission: "media", mediaType: "video", isMainFrame: true };
  assert.equal(pm.check({ tabId: 2, origin: SITE, ...base }), false, "another tab");
  assert.equal(pm.check({ tabId: 1, origin: "https://other.example.com", ...base }), false, "another site");
  assert.equal(pm.check({ tabId: 1, origin: "http://meet.example.com", ...base }), false, "same host, different scheme");
});

test("a check finds the grant even though Chromium adds a trailing slash to the origin", () => {
  // Regression: a real request carries the page URL, but the later check carries "https://host/" and never matched.
  const { pm, ask } = setup();
  ask({ origin: "https://meet.example.com/some/page?x=1", permission: "notifications", mediaTypes: undefined });
  pm.resolve(pm.snapshot()[0].id, true);
  const base = { tabId: 1, permission: "notifications", isMainFrame: true };
  assert.equal(pm.check({ ...base, origin: "https://meet.example.com/" }), true);
  assert.equal(pm.check({ ...base, origin: "https://meet.example.com" }), true);
  assert.equal(pm.check({ ...base, origin: "http://meet.example.com/" }), false, "scheme still matters");
  assert.equal(pm.check({ ...base, origin: "https://meet.example.com:8443/" }), false, "port still matters");
});

test("only web origins are ever prompted for", () => {
  const { pm, ask } = setup();
  for (const origin of ["about:blank", "file:///C:/page.html", "chrome-extension://abc/index.html", "not a url", "", undefined]) {
    assert.equal(ask({ origin, permission: "notifications", mediaTypes: undefined }).value, false, String(origin));
  }
  assert.equal(pm.snapshot().length, 0);
});

test("a check with no page attached (Chromium does this to show a notification) goes by site", () => {
  const { pm, ask } = setup();
  const noPage = { tabId: null, permission: "notifications", isMainFrame: false };
  assert.equal(pm.check({ ...noPage, origin: SITE }), false, "nothing granted yet");
  ask({ permission: "notifications", mediaTypes: undefined });
  pm.resolve(pm.snapshot()[0].id, true);
  assert.equal(pm.check({ ...noPage, origin: SITE }), true, "granted by a page of that site");
  assert.equal(pm.check({ ...noPage, origin: "https://other.example.com" }), false, "but not for another site");
  pm.forgetTab(1);
  assert.equal(pm.check({ ...noPage, origin: SITE }), false, "and it ends with the page");
});

test("a sub-frame cannot use its parent's grant", () => {
  const { pm, ask } = setup();
  ask();
  pm.resolve(pm.snapshot()[0].id, true);
  const frame = { tabId: 1, permission: "media", mediaType: "video", isMainFrame: false };
  assert.equal(pm.check({ ...frame, origin: "https://ads.example.net", embeddingOrigin: SITE }), false);
});

test("separate grants for camera and microphone cover a later request for both", () => {
  const { pm, ask } = setup();
  ask({ mediaTypes: ["video"] });
  pm.resolve(pm.snapshot()[0].id, true);
  const audio = ask({ mediaTypes: ["audio"] });
  assert.equal(audio.value, undefined, "microphone is new, so it asks");
  pm.resolve(pm.snapshot()[0].id, true);
  const both = ask({ mediaTypes: ["video", "audio"] });
  assert.equal(both.value, true, "both are now covered, so no prompt");
  assert.equal(pm.snapshot().length, 0);
});

test("an identical question already on screen shares one answer", () => {
  const { pm, ask } = setup();
  const first = ask({ permission: "notifications", mediaTypes: undefined });
  const second = ask({ permission: "notifications", mediaTypes: undefined });
  assert.equal(pm.snapshot().length, 1, "one prompt, not two");
  pm.resolve(pm.snapshot()[0].id, true);
  assert.equal(first.value, true);
  assert.equal(second.value, true);
  assert.equal(first.calls + second.calls, 2, "each callback is called exactly once");
});

test("Block is remembered until the page changes", () => {
  const { pm, ask } = setup();
  ask({ permission: "notifications", mediaTypes: undefined });
  pm.resolve(pm.snapshot()[0].id, false);
  const again = ask({ permission: "notifications", mediaTypes: undefined });
  assert.equal(again.value, false, "refused straight away");
  assert.equal(pm.snapshot().length, 0, "and the user is not asked again");
  pm.forgetTab(1);
  ask({ permission: "notifications", mediaTypes: undefined });
  assert.equal(pm.snapshot().length, 1, "after navigating, the site may ask afresh");
});

test("navigating or closing a tab refuses what is waiting and revokes what was granted", () => {
  const { pm, ask, changes } = setup();
  const granted = ask();
  pm.resolve(pm.snapshot()[0].id, true);
  const waiting = ask({ permission: "notifications", mediaTypes: undefined });
  assert.equal(waiting.value, undefined);
  const before = changes();
  pm.forgetTab(1);
  assert.equal(waiting.value, false, "the pending request is refused");
  assert.equal(waiting.calls, 1);
  assert.equal(granted.calls, 1, "the earlier answer is not repeated");
  assert.equal(pm.check({ tabId: 1, origin: SITE, permission: "media", mediaType: "video", isMainFrame: true }), false);
  assert.equal(pm.snapshot().length, 0);
  assert.equal(changes(), before + 1);
});

test("forgetting a tab that holds nothing does not notify", () => {
  const { pm, changes } = setup();
  pm.forgetTab(99);
  assert.equal(changes(), 0);
});

test("a callback that throws does not break the others", () => {
  const { pm } = setup();
  let ok = false;
  pm.request({ tabId: 1, origin: SITE, permission: "notifications", isMainFrame: true, respond: () => { throw new Error("frame gone"); } });
  pm.request({ tabId: 1, origin: SITE, permission: "notifications", isMainFrame: true, respond: () => { ok = true; } });
  pm.resolve(pm.snapshot()[0].id, true);
  assert.equal(ok, true);
});

test("answering an unknown id is harmless", () => {
  const { pm } = setup();
  pm.resolve(12345, true);
  assert.equal(pm.snapshot().length, 0);
});
