import type { ReactiveController, ReactiveControllerHost } from "lit";
import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { classHighlighter, highlightTree } from "@lezer/highlight";
import type { DiffHunk, DiffLine } from "./types.js";

interface Token {
  text: string;
  classes: string;
}

export class DiffSyntaxController implements ReactiveController {
  tokens = new Map<DiffLine, Token[]>();
  private hunks: DiffHunk[] | undefined;
  private path = "";
  private request = 0;

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this);
  }
  hostDisconnected(): void {
    this.request++;
    this.hunks = undefined;
  }

  async load(hunks: DiffHunk[], path: string): Promise<void> {
    if (hunks === this.hunks && path === this.path) {
      return;
    }
    this.hunks = hunks;
    this.path = path;
    this.tokens = new Map();
    const request = ++this.request;
    const language = LanguageDescription.matchFilename(languages, path);
    if (!language) {
      return;
    }
    try {
      const support = await language.load();
      if (request !== this.request) {
        return;
      }
      const lines = hunks.flatMap((hunk) => hunk.lines);
      const text = lines.map((line) => line.text.replace(/\r?\n$/, "") + "\n").join("");
      const spans: { from: number; to: number; classes: string }[] = [];
      highlightTree(support.language.parser.parse(text), classHighlighter, (from, to, classes) => {
        spans.push({ from, to, classes });
      });
      let offset = 0;
      for (const line of lines) {
        const source = line.text.replace(/\r?\n$/, "");
        const tokens: Token[] = [];
        let position = 0;
        for (const span of spans) {
          const from = Math.max(0, span.from - offset);
          const to = Math.min(source.length, span.to - offset);
          if (from >= to) {
            continue;
          }
          if (from > position) {
            tokens.push({ text: source.slice(position, from), classes: "" });
          }
          tokens.push({ text: source.slice(from, to), classes: span.classes });
          position = to;
        }
        if (position < source.length) {
          tokens.push({ text: source.slice(position), classes: "" });
        }
        this.tokens.set(line, tokens);
        offset += source.length + 1;
      }
      this.host.requestUpdate();
    } catch {
      if (request === this.request) {
        this.tokens = new Map();
      }
    }
  }
}
