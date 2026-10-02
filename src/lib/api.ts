export interface TabInfo {
  id: number;
  url: string;
  title: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  readMode: boolean;
  blocked: number;
  /** Why this tab's renderer died (for example "crashed" or "oom"), or null while it is healthy. */
  crashed: string | null;
  active: boolean;
}

/** A site asking to use something sensitive. It waits for the user's Allow or Block. */
export interface PermissionRequest {
  id: number;
  tabId: number;
  origin: string;
  permission: "media" | "notifications";
  mediaTypes: ("video" | "audio")[];
}

export interface AppInfo {
  version: string;
  electron: string;
  chromium: string;
  platform: string;
}

export interface CrashInfo {
  dir: string;
  count: number;
  bytes: number;
  latest: number | null;
}

export interface Provider {
  id: string;
  api: "openai" | "anthropic";
  baseUrl: string;
  model: string;
}

export interface Bookmark {
  url: string;
  title: string;
}

export interface Settings {
  provider: Provider;
  hasKey: Record<string, boolean>;
  bookmarks: Bookmark[];
  webhooks: { name: string; url: string }[];
}

export interface PageText {
  url: string;
  title: string;
  description: string;
  text: string;
  words: number;
  bytes: number;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

interface Bridge {
  invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;
  onTabs(cb: (tabs: TabInfo[]) => void): () => void;
  onPermissions(cb: (requests: PermissionRequest[]) => void): () => void;
}

declare global {
  interface Window {
    ibon: Bridge;
  }
}

const b = () => window.ibon;

export const api = {
  createTab: (url?: string) => b().invoke<number>("tab:create", url),
  closeTab: (id: number) => b().invoke("tab:close", id),
  activateTab: (id: number) => b().invoke("tab:activate", id),
  navigate: (url: string) => b().invoke("tab:navigate", url),
  back: () => b().invoke("tab:back"),
  forward: () => b().invoke("tab:forward"),
  reload: () => b().invoke("tab:reload"),
  devtools: () => b().invoke("tab:devtools"),
  setReadMode: (on?: boolean) => b().invoke<boolean>("tab:readMode", on),
  layout: (r: { x: number; y: number; width: number; height: number }, visible: boolean) => b().invoke("view:layout", r, visible),
  readPage: () => b().invoke<PageText>("page:read"),
  copy: (text: string) => b().invoke("clipboard:write", text),
  appInfo: () => b().invoke<AppInfo>("app:info"),
  crashInfo: () => b().invoke<CrashInfo>("crash:info"),
  openCrashFolder: () => b().invoke("crash:open"),
  getSettings: () => b().invoke<Settings>("settings:get"),
  setSettings: (patch: Partial<Pick<Settings, "provider" | "bookmarks" | "webhooks">>) => b().invoke<Settings>("settings:set", patch),
  setKey: (id: string, key: string) => b().invoke<Settings>("settings:setKey", id, key),
  chat: (messages: ChatMessage[], withPage: boolean) => b().invoke<string>("ai:chat", messages, withPage),
  summarize: (length: "short" | "medium" | "detailed") => b().invoke<{ summary: string; page: PageText }>("ai:summarize", length),
  netTool: (tool: "dns" | "headers" | "ping" | "rdap", host: string) => b().invoke<unknown>("dev:netTool", tool, host),
  webhook: (url: string, payload: unknown) => b().invoke<{ ok: boolean; status: number }>("dev:webhook", url, payload),
  onTabs: (cb: (tabs: TabInfo[]) => void) => b().onTabs(cb),
  permissions: () => b().invoke<PermissionRequest[]>("permission:list"),
  respondPermission: (id: number, allow: boolean) => b().invoke("permission:respond", id, allow),
  onPermissions: (cb: (requests: PermissionRequest[]) => void) => b().onPermissions(cb),
};
