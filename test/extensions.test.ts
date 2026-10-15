import { afterEach, expect, it, vi } from "vitest";
import type { ReactiveControllerHost } from "lit";
import { TerminalSessionController } from "@tacta/terminal/terminal-session-controller";
import { BrowserSessionController } from "@tacta/browser/browser-session-controller";
import type { TerminalConnector, TerminalFrame, TerminalSession } from "@tacta/terminal";
import type { BrowserSession, BrowserUpdate } from "@tacta/browser";
import { expandCommand } from "@tacta/chat/composer/composer-commands";
import { setLocale } from "@tacta/core/i18n";
import "@tacta/question/register";
import "@tacta/image-editor/register";
import "@tacta/file-preview/register";
import "@tacta/browser/register";

afterEach(() => {
  document.body.replaceChildren();
  setLocale("en");
});
function host(): ReactiveControllerHost {
  return {
    addController() {},
    removeController() {},
    requestUpdate() {},
    updateComplete: Promise.resolve(true),
  };
}
function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}
function terminal(open: TerminalConnector, sessionId = "") {
  const write = vi.fn(async (_data: string) => {});
  const input = vi.fn();
  const controller = new TerminalSessionController(host(), {
    connector: () => open,
    sessionId: () => sessionId,
    reset: vi.fn(),
    measure: () => ({ cols: 80, rows: 24 }),
    write,
    onConnecting: vi.fn(),
    onReady: vi.fn(),
    onInput: input,
  });
  controller.hostConnected();
  return { controller, write, input };
}

it("releases a terminal that opens after its element was disconnected", async () => {
  const pending = deferred<TerminalSession>();
  const close = vi.fn();
  const { controller } = terminal(() => pending.promise);
  const connecting = controller.connect();
  controller.hostDisconnected();
  pending.resolve({ frames: (async function* () {})(), close });
  await connecting;
  expect(close).toHaveBeenCalledOnce();
  expect(controller.status).toBe("disconnected");
});

it("deduplicates agent output, normalizes lines and disables shell input", async () => {
  const close = vi.fn();
  async function* frames(): AsyncIterable<TerminalFrame> {
    yield { type: "ready", seq: 0 };
    yield { type: "output", data: "agent\noutput", seq: 1 };
    yield { type: "output", data: "duplicate", seq: 1 };
    yield { type: "exit", exitCode: 0, seq: 2 };
  }
  const { controller, write, input } = terminal(
    async () => ({ frames: frames(), close }),
    "agent-1",
  );
  await controller.connect();
  expect(write).toHaveBeenCalledExactlyOnceWith("agent\r\noutput");
  expect(input).not.toHaveBeenCalledWith(true);
  expect(controller.status).toBe("ended");
  expect(controller.exitCode).toBe(0);
  expect(close).toHaveBeenCalledOnce();
});

it("does not replay queued terminal commands after a failed write", async () => {
  const finish = deferred<void>();
  const ready = deferred<void>();
  const write = vi.fn(async (_data: string) => {
    throw new Error("connection lost");
  });
  async function* frames(): AsyncIterable<TerminalFrame> {
    yield { type: "ready" };
    ready.resolve();
    await finish.promise;
  }
  const { controller } = terminal(async () => ({
    frames: frames(),
    write,
    close: () => finish.resolve(),
  }));
  const connecting = controller.connect();
  await ready.promise;
  controller.send("first");
  controller.send("second");
  await vi.waitFor(() => expect(controller.status).toBe("disconnected"));
  await connecting;
  expect(write).toHaveBeenCalledExactlyOnceWith("first");
});

it("releases a browser session that opens after disconnection", async () => {
  const pending = deferred<BrowserSession>();
  const close = vi.fn();
  const controller = new BrowserSessionController(host(), {
    connector: () => () => pending.promise,
    viewport: () => ({ width: 800, height: 600, deviceScaleFactor: 1 }),
    onVideo: vi.fn(),
    onReady: vi.fn(),
    onState: vi.fn(),
    onFavicon: vi.fn(),
    onEnded: vi.fn(),
  });
  controller.hostConnected();
  const connecting = controller.connect();
  controller.hostDisconnected();
  pending.resolve({
    updates: (async function* (): AsyncIterable<BrowserUpdate> {})(),
    navigate() {},
    back() {},
    forward() {},
    reload() {},
    stop() {},
    resize() {},
    input() {},
    close,
  });
  await connecting;
  expect(close).toHaveBeenCalledOnce();
  expect(controller.ready).toBe(false);
});

it("uses the question UI without installing or registering chat", async () => {
  const question = document.createElement("tacta-composer-question");
  question.question = {
    id: "q1",
    prompt: "Which tools?",
    options: [{ id: "shell", label: "Terminal" }],
  };
  const answer = vi.fn();
  question.addEventListener("question-response", answer);
  document.body.append(question);
  await question.updateComplete;
  const option = question.shadowRoot!.querySelector<HTMLInputElement>('input[type="radio"]')!;
  option.click();
  await question.updateComplete;
  question.shadowRoot!.querySelector<HTMLFormElement>("form")!.requestSubmit();
  expect(answer.mock.calls[0]![0].detail).toEqual({
    questionId: "q1",
    action: "answer",
    answer: "Terminal",
    optionId: "shell",
  });
  setLocale("de");
  await question.updateComplete;
  expect(question.shadowRoot!.textContent).toContain("Frage");
});

it("blocks unsafe browser addresses and normalizes bare hosts", async () => {
  const address = document.createElement("tacta-browser-address-bar");
  const submit = vi.fn();
  address.addEventListener("address-submit", submit);
  document.body.append(address);
  await address.updateComplete;
  const input = address.shadowRoot!.querySelector<HTMLInputElement>("input")!;
  input.focus();
  input.value = "javascript:alert(1)";
  input.dispatchEvent(new Event("input"));
  address.shadowRoot!.querySelector<HTMLFormElement>("form")!.requestSubmit();
  expect(submit).not.toHaveBeenCalled();
  input.value = "example.com/docs";
  input.dispatchEvent(new Event("input"));
  input.setCustomValidity("");
  address.shadowRoot!.querySelector<HTMLFormElement>("form")!.requestSubmit();
  expect(submit.mock.calls[0]![0].detail).toBe("https://example.com/docs");
});

it("loads a CSV viewer on demand and renders values from its worker", async () => {
  const preview = document.createElement("tacta-file-preview");
  preview.file = {
    path: "extensions.csv",
    content: "Name,Status\nTerminal,Ready\nBrowser,Ready",
    encoding: "utf-8",
    size: 50,
  };
  document.body.append(preview);
  await vi.waitFor(() => {
    const sheet = preview.shadowRoot?.querySelector("tacta-spreadsheet-preview");
    expect(sheet?.shadowRoot?.textContent).toContain("Terminal");
    expect(sheet?.shadowRoot?.textContent).toContain("Browser");
  });
});

it("expands prompt commands without treating management actions as a prompt", () => {
  const commands = [
    {
      command: "review",
      title: "Review",
      description: "",
      kind: "prompt" as const,
      prompt: "Review the code.",
    },
  ];
  expect(expandCommand("/review src", commands)).toBe("Review the code.\n\nsrc");
  expect(expandCommand("Plain text", commands)).toBe("Plain text");
});
