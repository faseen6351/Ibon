// Turns raw HTML into clean readable text (used by Read Mode and the AI).

export const TRACKER_SIGNATURES = [
  "googletagmanager", "google-analytics", "doubleclick", "facebook.net", "fbcdn",
  "hotjar", "mixpanel", "segment.io", "segment.com", "clarity.ms", "adservice.google",
  "adsystem", "amazon-adsystem", "taboola", "outbrain", "criteo", "scorecardresearch",
  "quantserve", "chartbeat", "optimizely",
];

export function isTracker(url) {
  const u = url.toLowerCase();
  return TRACKER_SIGNATURES.some((s) => u.includes(s));
}

const NAMED_ENTITIES = { nbsp: " ", lt: "<", gt: ">", quot: '"', apos: "'" };

function codePoint(code, original) {
  try {
    return String.fromCodePoint(code);
  } catch {
    return original; // not a valid code point; leave it as written
  }
}

/** Decodes the common HTML entities. `&amp;` goes last so `&amp;lt;` correctly stays the text "&lt;". */
export function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (m, n) => codePoint(Number(n), m))
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => codePoint(parseInt(h, 16), m))
    .replace(/&(nbsp|lt|gt|quot|apos);/g, (_, name) => NAMED_ENTITIES[name])
    .replace(/&amp;/g, "&");
}

export function extractReadable(html, url) {
  const title = decodeEntities(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      "",
  );
  const description = decodeEntities(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      "",
  );

  let body = html
    .replace(/<head[\s\S]*?<\/head>/i, " ") // the title and meta tags are not page text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const mainMatch =
    body.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    body.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch && mainMatch[1].length > 400) body = mainMatch[1];

  body = decodeEntities(
    body
      .replace(/<(nav|header|footer|aside|form|iframe|button|select)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|tr|section)>/gi, "\n\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    url,
    title: title || url,
    description,
    text: body.slice(0, 60000),
    words: body ? body.split(/\s+/).length : 0,
    bytes: html.length,
  };
}
