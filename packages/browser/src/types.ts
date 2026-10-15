import type { KeyInput, MouseInput, ScrollInput } from "./data/browser-input.js";
export interface BrowserViewport {
  width: number;
  height: number;
  deviceScaleFactor: number;
}
export interface BrowserStateUpdate {
  url?: string;
  title?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  loading?: boolean;
}
export type BrowserUpdate =
  | { type: "state"; state: BrowserStateUpdate }
  | { type: "video"; stream: MediaStream }
  | { type: "cursor"; cursor: string }
  | { type: "favicon"; url: string };
export type BrowserInput =
  | { type: "mouse"; input: MouseInput }
  | { type: "key"; input: KeyInput }
  | { type: "scroll"; input: ScrollInput }
  | { type: "text"; text: string };
export interface BrowserSession {
  stream?: MediaStream;
  updates: AsyncIterable<BrowserUpdate>;
  navigate(url: string): void | Promise<void>;
  back(): void | Promise<void>;
  forward(): void | Promise<void>;
  reload(): void | Promise<void>;
  stop(): void | Promise<void>;
  resize(viewport: BrowserViewport): void | Promise<void>;
  input(input: BrowserInput): void | Promise<void>;
  copy?(): Promise<string>;
  paste?(text: string): void | Promise<void>;
  close(): void | Promise<void>;
}
/** Each viewer gets its own session. The application owns video/WebRTC and RPC. */
export type BrowserConnector = (options: {
  viewport: BrowserViewport;
  signal: AbortSignal;
}) => Promise<BrowserSession>;
export interface BrowserEventMap {
  "browser-state": CustomEvent<BrowserStateUpdate>;
  "browser-page-change": CustomEvent<{ url: string; title: string; favicon: string }>;
  "browser-ready": CustomEvent<void>;
  "browser-ended": CustomEvent<void>;
  "browser-favicon": CustomEvent<string>;
}
