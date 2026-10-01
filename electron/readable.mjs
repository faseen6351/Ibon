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

export function extractReadable(html, url) {
  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    "";
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    "";

  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const mainMatch =
    body.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    body.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch && mainMatch[1].length > 400) body = mainMatch[1];

  body = body
    .replace(/<(nav|header|footer|aside|form|iframe|button|select)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|section)>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
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
