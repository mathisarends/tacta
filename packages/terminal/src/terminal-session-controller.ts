import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { TerminalConnector, TerminalSession, TerminalSize } from "./types.js";
import { terminalText } from "./messages/index.js";

export type TerminalStatus = "connecting" | "connected" | "disconnected" | "ended";
type Options = {
  connector: () => TerminalConnector | undefined;
  sessionId: () => string;
  reset: () => void;
  measure: () => TerminalSize;
  write: (data: string) => Promise<void>;
  onConnecting: () => void;
  onReady: () => void;
  onInput: (enabled: boolean) => void;
};

export class TerminalSessionController implements ReactiveController {
  status: TerminalStatus = "disconnected";
  error = "";
  exitCode: number | null = null;
  private session?: TerminalSession;
  private abort?: AbortController;
  private generation = 0;
  private connected = false;
  private writes = Promise.resolve();
  private closed = new WeakSet<TerminalSession>();

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
    this.disconnect();
  }

  async connect(): Promise<void> {
    this.disconnect();
    const open = this.options.connector();
    if (!open || !this.connected) {
      return;
    }
    const generation = this.generation;
    const abort = new AbortController();
    this.abort = abort;
    this.error = "";
    this.exitCode = null;
    this.setStatus("connecting");
    this.options.onConnecting();
    let session: TerminalSession | undefined;
    let lastSeq = -1;
    try {
      session = await open({
        ...this.options.measure(),
        sessionId: this.options.sessionId() || undefined,
        signal: abort.signal,
      });
      if (generation !== this.generation || !this.connected) {
        return;
      }
      this.session = session;
      for await (const frame of session.frames) {
        if (generation !== this.generation) {
          break;
        }
        if (frame.seq !== undefined) {
          if (frame.seq <= lastSeq) {
            continue;
          }
          lastSeq = frame.seq;
        }
        switch (frame.type) {
          case "ready":
            this.setStatus("connected");
            this.options.onReady();
            break;
          case "reset":
            this.options.reset();
            break;
          case "output":
            await this.options.write(
              this.options.sessionId() ? frame.data.replace(/\r?\n/gu, "\r\n") : frame.data,
            );
            break;
          case "exit":
            this.exitCode = frame.exitCode ?? null;
            this.setStatus("ended");
            break;
        }
      }
      if (generation === this.generation && this.status !== "ended") {
        this.setStatus("disconnected");
      }
    } catch (error) {
      if (generation === this.generation) {
        this.fail(error);
      }
    } finally {
      if (this.session === session) {
        this.session = undefined;
      }
      abort.abort();
      if (session) {
        await this.close(session);
      }
    }
  }

  send(data: string): void {
    const session = this.session;
    if (!session || this.status !== "connected" || this.options.sessionId()) {
      return;
    }
    for (const [chunk] of data.matchAll(/[\s\S]{1,8192}/gu)) {
      this.writes = this.writes
        .then(async () => {
          if (session === this.session && this.status === "connected") {
            await session.write?.(chunk);
          }
        })
        .catch((error: unknown) => {
          if (session === this.session) {
            this.fail(error);
          }
        });
    }
  }
  resize(cols: number, rows: number): void {
    const session = this.session;
    if (!session || this.options.sessionId()) {
      return;
    }
    void Promise.resolve()
      .then(() => session.resize?.({ cols, rows }))
      .catch((error: unknown) => {
        if (session === this.session) {
          this.fail(error);
        }
      });
  }
  private fail(error: unknown): void {
    this.disconnect();
    this.error = error instanceof Error ? error.message : terminalText.unavailable;
    this.host.requestUpdate();
  }
  disconnect(): void {
    ++this.generation;
    this.abort?.abort();
    const session = this.session;
    this.session = undefined;
    if (session) {
      void this.close(session);
    }
    this.writes = Promise.resolve();
    this.setStatus("disconnected");
  }
  private setStatus(status: TerminalStatus): void {
    this.status = status;
    this.options.onInput(status === "connected" && !this.options.sessionId());
    this.host.requestUpdate();
  }
  private async close(session: TerminalSession): Promise<void> {
    if (this.closed.has(session)) {
      return;
    }
    this.closed.add(session);
    try {
      await session.close();
    } catch {
      /* Cleanup must not create an unhandled rejection. */
    }
  }
}
