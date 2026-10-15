import type { ReactiveController, ReactiveControllerHost } from "lit";
import type {
  BrowserConnector,
  BrowserSession,
  BrowserStateUpdate,
  BrowserViewport,
} from "./types.js";
import type { KeyInput, MouseInput, ScrollInput } from "./data/browser-input.js";
import { browserText } from "./messages/index.js";

type Options = {
  connector: () => BrowserConnector | undefined;
  viewport: () => BrowserViewport | undefined;
  onVideo: (stream: MediaStream | undefined) => void;
  onReady: () => void;
  onState: (state: BrowserStateUpdate) => void;
  onFavicon: (url: string) => void;
  onEnded: () => void;
};
export class BrowserSessionController implements ReactiveController {
  status: "connecting" | "connected" | "disconnected" = "disconnected";
  error = "";
  cursor = "default";
  private session?: BrowserSession;
  private abort?: AbortController;
  private generation = 0;
  private connected = false;
  private pendingUrl = "";
  private commands = Promise.resolve();
  private inputs = Promise.resolve();
  private closed = new WeakSet<BrowserSession>();
  get ready(): boolean {
    return Boolean(this.session);
  }
  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: Options,
  ) {
    host.addController(this);
  }
  hostConnected(): void {
    this.connected = true;
  }
  hostDisconnected(): void {
    this.connected = false;
    this.pendingUrl = "";
    this.disconnect();
  }
  async connect(): Promise<void> {
    const open = this.options.connector();
    const viewport = this.options.viewport();
    if (!this.connected || !open || !viewport || this.status === "connecting" || this.session) {
      return;
    }
    const generation = ++this.generation;
    const abort = new AbortController();
    this.abort = abort;
    this.error = "";
    this.status = "connecting";
    this.host.requestUpdate();
    let session: BrowserSession | undefined;
    try {
      session = await open({ viewport, signal: abort.signal });
      if (generation !== this.generation || !this.connected) {
        return;
      }
      this.session = session;
      this.status = "connected";
      this.options.onVideo(session.stream);
      this.host.requestUpdate();
      this.options.onReady();
      if (this.pendingUrl) {
        this.navigate(this.pendingUrl);
        this.pendingUrl = "";
      }
      for await (const update of session.updates) {
        if (generation !== this.generation) {
          break;
        }
        switch (update.type) {
          case "state":
            this.options.onState(update.state);
            break;
          case "video":
            this.options.onVideo(update.stream);
            break;
          case "favicon":
            this.options.onFavicon(update.url);
            break;
          case "cursor":
            this.cursor = update.cursor;
            this.host.requestUpdate();
            break;
        }
      }
      if (generation === this.generation) {
        this.fail(new Error(browserText.unavailable));
      }
    } catch (error) {
      if (generation === this.generation) {
        this.fail(error);
      }
    } finally {
      abort.abort();
      if (session) {
        await this.close(session);
      }
    }
  }
  disconnect(): void {
    ++this.generation;
    this.abort?.abort();
    const session = this.session;
    this.session = undefined;
    if (session) {
      void this.close(session);
    }
    this.status = "disconnected";
    this.cursor = "default";
    this.commands = Promise.resolve();
    this.inputs = Promise.resolve();
    this.options.onVideo(undefined);
    this.options.onEnded();
    this.host.requestUpdate();
  }
  private fail(error: unknown): void {
    this.disconnect();
    this.error = error instanceof Error ? error.message : browserText.unavailable;
    this.host.requestUpdate();
  }
  private command(action: (session: BrowserSession) => void | Promise<void>, input = false): void {
    const session = this.session;
    if (!session) {
      return;
    }
    const queue = input ? this.inputs : this.commands;
    const next = queue
      .then(async () => {
        if (session === this.session) {
          await action(session);
        }
      })
      .catch((error: unknown) => {
        if (session === this.session) {
          this.fail(error);
        }
      });
    if (input) {
      this.inputs = next;
    } else {
      this.commands = next;
    }
  }
  navigate(url: string): void {
    if (!this.session) {
      this.pendingUrl = url;
      return;
    }
    this.command((session) => session.navigate(url));
  }
  back(): void {
    this.command((session) => session.back());
  }
  forward(): void {
    this.command((session) => session.forward());
  }
  reload(): void {
    this.command((session) => session.reload());
  }
  stop(): void {
    this.command((session) => session.stop());
  }
  resize(): void {
    const viewport = this.options.viewport();
    if (viewport) {
      this.command((session) => session.resize(viewport));
    }
  }
  mouse(input: MouseInput): void {
    this.command((session) => session.input({ type: "mouse", input }), true);
  }
  key(input: KeyInput): void {
    this.command((session) => session.input({ type: "key", input }), true);
  }
  scroll(input: ScrollInput): void {
    this.command((session) => session.input({ type: "scroll", input }), true);
  }
  insert(text: string): void {
    this.command((session) => session.input({ type: "text", text }), true);
  }
  paste(text: string): void {
    this.command((session) => session.paste?.(text), true);
  }
  copySelection(): void {
    this.command(async (session) => {
      const text = await session.copy?.();
      if (text !== undefined) {
        await navigator.clipboard.writeText(text);
      }
    }, true);
  }
  pasteClipboard(): void {
    this.command(async (session) => {
      await session.paste?.(await navigator.clipboard.readText());
    }, true);
  }
  private async close(session: BrowserSession): Promise<void> {
    if (this.closed.has(session)) {
      return;
    }
    this.closed.add(session);
    try {
      await session.close();
    } catch {
      /* Cleanup is best-effort after disconnect. */
    }
  }
}
