import { test } from "node:test";
import assert from "node:assert/strict";

import { decodeEntities, extractReadable, isTracker } from "./readable.mjs";

test("decodes named, decimal and hex entities", () => {
  assert.equal(decodeEntities("a&nbsp;b &lt;tag&gt; &quot;q&quot; it&#39;s &#x41;&#66;"), "a b <tag> \"q\" it's AB");
});

test("&amp; is decoded last, so an escaped entity stays literal text", () => {
  assert.equal(decodeEntities("&amp;lt;"), "&lt;");
  assert.equal(decodeEntities("Tom &amp; Jerry"), "Tom & Jerry");
});

test("leaves an invalid numeric entity as written", () => {
  assert.equal(decodeEntities("x&#99999999999;y"), "x&#99999999999;y");
});

test("extractReadable decodes the title and description too", () => {
  const html = `<html><head><title>Fish &amp; Chips</title><meta name="description" content="Copyright &lt;YEAR&gt;"></head><body><p>Hello</p></body></html>`;
  const page = extractReadable(html, "https://example.test/");
  assert.equal(page.title, "Fish & Chips");
  assert.equal(page.description, "Copyright <YEAR>");
});

test("extractReadable drops scripts, styles and page chrome but keeps the text", () => {
  const html = `<html><head><title>T</title><style>p{color:red}</style><script>var x = 1</script></head>
    <body><nav>menu</nav><p>First paragraph.</p><p>Second &amp; last.</p><footer>footer text</footer></body></html>`;
  const page = extractReadable(html, "https://example.test/");
  assert.match(page.text, /First paragraph\./);
  assert.match(page.text, /Second & last\./);
  assert.doesNotMatch(page.text, /menu|footer text|color:red|var x/);
  assert.equal(page.words, 5);
});

test("recognises tracker URLs", () => {
  assert.equal(isTracker("https://www.googletagmanager.com/gtm.js?id=GTM-1"), true);
  assert.equal(isTracker("https://example.test/app.js"), false);
});
