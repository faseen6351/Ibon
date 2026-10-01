export interface ProviderPreset {
  id: string;
  label: string;
  baseUrl: string;
  model: string;
  needsKey: boolean;
  /** 'openai' = OpenAI-compatible /chat/completions, 'anthropic' = /v1/messages */
  api: "openai" | "anthropic";
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  { id: "ollama", label: "Local / Ollama (offline)", baseUrl: "http://localhost:11434/v1", model: "llama3.1", needsKey: false, api: "openai" },
  { id: "openai", label: "ChatGPT / OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", needsKey: true, api: "openai" },
  { id: "anthropic", label: "Claude / Anthropic", baseUrl: "https://api.anthropic.com/v1", model: "claude-sonnet-4-5", needsKey: true, api: "anthropic" },
  { id: "grok", label: "Grok / xAI", baseUrl: "https://api.x.ai/v1", model: "grok-3-mini", needsKey: true, api: "openai" },
  { id: "deepseek", label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat", needsKey: true, api: "openai" },
  { id: "kimi", label: "Kimi / Moonshot", baseUrl: "https://api.moonshot.ai/v1", model: "kimi-k2-0905-preview", needsKey: true, api: "openai" },
  { id: "glm", label: "GLM / Zhipu", baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4.5-flash", needsKey: true, api: "openai" },
  { id: "custom", label: "Custom (OpenAI-compatible)", baseUrl: "", model: "", needsKey: false, api: "openai" },
];
