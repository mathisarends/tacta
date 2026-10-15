import type { TerminalConnector, TerminalFrame } from "@tacta/terminal";
import type { BrowserConnector, BrowserUpdate } from "@tacta/browser";

/** Demo-only streams. Production adapters bridge the application's transport. */
class Queue<T> implements AsyncIterable<T> {
  private items: T[] = [];
  private waiting?: (result: IteratorResult<T>) => void;
  private ended = false;
  push(value: T): void {
    if (this.ended) {
      return;
    }
    if (this.waiting) {
      const resolve = this.waiting;
      this.waiting = undefined;
      resolve({ value, done: false });
    } else {
      this.items.push(value);
    }
  }
  close(): void {
    this.ended = true;
    this.items = [];
    this.waiting?.({ value: undefined, done: true });
    this.waiting = undefined;
  }
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        if (this.items.length) {
          return Promise.resolve({ value: this.items.shift()!, done: false });
        }
        if (this.ended) {
          return Promise.resolve({ value: undefined, done: true });
        }
        return new Promise((resolve) => {
          this.waiting = resolve;
        });
      },
    };
  }
}
export const createDemoTerminal: TerminalConnector = async ({ signal }) => {
  const frames = new Queue<TerminalFrame>();
  let line = "";
  const output = (data: string): void => frames.push({ type: "output", data });
  const prompt = (): void => output("\x1b[38;2;169;227;210m❯\x1b[0m ");
  signal.addEventListener("abort", () => frames.close(), { once: true });
  frames.push({ type: "ready" });
  output("$ pwd\r\n/workspace\r\n$ ls\r\nREADME.md  src/  docs/\r\n\r\n");
  prompt();
  return {
    frames,
    write(data) {
      for (const key of data) {
        if (key === "\r") {
          output("\r\n");
          const command = line.trim();
          line = "";
          switch (command) {
            case "clear":
              output("\x1b[2J\x1b[H");
              break;
            case "pwd":
              output("/your-app/workspace\r\n");
              break;
            case "ls":
            case "extensions":
              output(
                "core/  chat/  question/  workspace-panel/\r\nterminal/  browser/  image-editor/  file-preview/\r\nsidebar/  voice-input/  markdown/  code-diff/\r\nmarkdown-document/  workspace/\r\n",
              );
              break;
            case "help":
              output(
                "Demo commands: help · ls · extensions · pwd · clear\r\nYour app supplies a real TerminalConnector.\r\n",
              );
              break;
            case "npm run build":
              output("\x1b[32m✓\x1b[0m Selected extensions built successfully (demo).\r\n");
              break;
            case "":
              break;
            default:
              output(`Demo received: ${command}\r\n`);
          }
          prompt();
        } else if (key === "\x7f") {
          if (line) {
            line = line.slice(0, -1);
            output("\b \b");
          }
        } else if (key === "\x03") {
          line = "";
          output("^C\r\n");
          prompt();
        } else if (key >= " " && key !== "\x7f") {
          line += key;
          output(key);
        }
      }
    },
    resize() {},
    close() {
      frames.close();
    },
  };
};
export function sampleImage(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 620;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#f9fafb";
  context.fillRect(0, 0, 1000, 620);
  context.fillStyle = "#25262a";
  context.font = "500 30px system-ui";
  context.fillText("Requests per day", 64, 72);
  context.font = "16px system-ui";
  context.fillStyle = "#6b7280";
  context.fillText("Example data · 12–16 October", 64, 110);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const counts = [24, 38, 31, 46, 42];
  for (let tick = 0; tick <= 50; tick += 10) {
    const y = 500 - tick * 6;
    context.strokeStyle = "#e5e7eb";
    context.beginPath();
    context.moveTo(80, y);
    context.lineTo(930, y);
    context.stroke();
    context.fillStyle = "#6b7280";
    context.fillText(String(tick), 40, y + 5);
  }
  counts.forEach((count, index) => {
    const x = 115 + index * 170;
    context.fillStyle = "#6c9f8e";
    context.fillRect(x, 500 - count * 6, 92, count * 6);
    context.fillStyle = "#4b5563";
    context.fillText(days[index]!, x + 24, 536);
  });
  return canvas.toDataURL("image/png");
}
export const createDemoBrowser: BrowserConnector = async ({ viewport, signal }) => {
  const updates = new Queue<BrowserUpdate>();
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d")!;
  const history: string[] = [];
  let position = -1;
  const draw = (): void => {
    context.fillStyle = "#f8f8f8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#343434";
    context.font = "24px system-ui";
    context.fillText("Remote browser content", 40, 80);
    context.fillStyle = "#737373";
    context.font = "15px system-ui";
    context.fillText("The application supplies the video stream.", 40, 116);
    context.fillText(history[position] ?? "about:blank", 40, 154);
  };
  const publish = (): void => {
    draw();
    updates.push({
      type: "state",
      state: {
        url: history[position] ?? "",
        title: "Tacta documentation",
        canGoBack: position > 0,
        canGoForward: position < history.length - 1,
        loading: false,
      },
    });
  };
  draw();
  const stream = canvas.captureStream(12);
  const close = (): void => {
    updates.close();
    for (const track of stream.getTracks()) {
      track.stop();
    }
  };
  signal.addEventListener("abort", close, { once: true });
  return {
    stream,
    updates,
    navigate(url) {
      history.splice(position + 1);
      history.push(url);
      position = history.length - 1;
      publish();
    },
    back() {
      if (position > 0) {
        --position;
        publish();
      }
    },
    forward() {
      if (position < history.length - 1) {
        ++position;
        publish();
      }
    },
    reload() {
      publish();
    },
    stop() {},
    resize(size) {
      canvas.width = size.width;
      canvas.height = size.height;
      draw();
    },
    input() {},
    close,
  };
};
