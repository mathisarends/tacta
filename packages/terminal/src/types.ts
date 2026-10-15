export interface TerminalSize {
  cols: number;
  rows: number;
}
export type TerminalFrame =
  | { type: "ready"; seq?: number }
  | { type: "reset"; seq?: number }
  | { type: "output"; data: string; seq?: number }
  | { type: "exit"; exitCode?: number; seq?: number };

export interface TerminalSession {
  frames: AsyncIterable<TerminalFrame>;
  write?(data: string): void | Promise<void>;
  resize?(size: TerminalSize): void | Promise<void>;
  close(): void | Promise<void>;
}

/** The host owns authentication, transport and remote process creation. */
export type TerminalConnector = (
  options: TerminalSize & {
    sessionId?: string;
    signal: AbortSignal;
  },
) => Promise<TerminalSession>;

export interface TerminalEventMap {
  "terminal-interrupt": CustomEvent<string>;
}
