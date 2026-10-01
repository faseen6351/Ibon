// Talks to any LLM the user configures: OpenAI-compatible APIs (OpenAI, Grok, DeepSeek,
// Kimi, GLM, Ollama, LM Studio, OpenRouter…) or the Anthropic Messages API.

export async function runChat(provider, messages) {
  const baseUrl = (provider.baseUrl || "").replace(/\/+$/, "");
  if (!baseUrl) throw new Error("No LLM provider configured. Open Settings and pick one.");
  if (!provider.model) throw new Error("No model set for this provider.");

  if (provider.api === "anthropic") {
    const system = messages.find((m) => m.role === "system")?.content;
    const rest = messages.filter((m) => m.role !== "system");
    const res = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": provider.apiKey ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 4096,
        ...(system ? { system } : {}),
        messages: rest,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message ?? `Anthropic error ${res.status}`);
    return (Array.isArray(data?.content) ? data.content : [])
      .filter((b) => b?.type === "text")
      .map((b) => b.text ?? "")
      .join("");
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(provider.apiKey ? { authorization: `Bearer ${provider.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: provider.model, messages, stream: false }),
    signal: AbortSignal.timeout(120000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? `Provider error ${res.status} from ${baseUrl}`);
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text) throw new Error("Provider returned an empty response");
  return text;
}

const LENGTH_GUIDANCE = {
  short: "Compress to at most 3 bullet points or 80 words. Keep only the most important facts.",
  medium: "Compress to a tight summary of at most 250 words with the key facts, figures and conclusions.",
  detailed: "Produce a structured briefing of at most 700 words: overview, key points, data, takeaways.",
};

export function summarize(provider, { text, title, length }) {
  return runChat(provider, [
    {
      role: "system",
      content:
        "You are Ibon's Token Reducer. Compress web content for LLMs: keep facts, numbers, names and conclusions; drop fluff, navigation, ads and boilerplate. Output clean Markdown only, with no preamble.",
    },
    {
      role: "user",
      content: `${LENGTH_GUIDANCE[length] ?? LENGTH_GUIDANCE.medium}\n\nTitle: ${title || "Untitled"}\n\nContent:\n${text.slice(0, 24000)}`,
    },
  ]);
}

export function chat(provider, { messages, pageContext }) {
  const system = `You are Ibon, an AI copilot inside a lightweight developer web browser. You can see the user's current page and control the browser by emitting action tags on their own line:

[action:open_url https://example.com] — open a URL in a new tab
[action:read_mode] — toggle read mode on the current tab
[action:summarize short|medium|detailed] — summarize the current page
[action:copy_content] — copy the page's clean text to the clipboard

Use actions only when they clearly help. Answer concisely in Markdown.${
    pageContext
      ? `\n\nCurrent page:\nURL: ${pageContext.url}\nTitle: ${pageContext.title}\nContent (truncated):\n${pageContext.text.slice(0, 12000)}`
      : "\n\nNo page is currently loaded."
  }`;
  return runChat(provider, [{ role: "system", content: system }, ...messages.slice(-20)]);
}
