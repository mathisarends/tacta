import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { TactaChatbotDemo } from "../examples/chatbot/chatbot-app.js";
import type { ChatComposer, ChatMessageList } from "@tacta/chat";

afterEach(() => document.body.replaceChildren());

async function mount() {
  const app = new TactaChatbotDemo();
  document.body.append(app);
  await app.updateComplete;
  return app;
}
function composer(app: TactaChatbotDemo): ChatComposer {
  return app.shadowRoot!.querySelector("tacta-chat-composer")!;
}
function history(app: TactaChatbotDemo): ChatMessageList | null {
  return app.shadowRoot!.querySelector("tacta-chat-message-list");
}
async function typeMessage(app: TactaChatbotDemo, text: string) {
  const element = composer(app);
  await element.updateComplete;
  const input = element.shadowRoot!.querySelector("tacta-composer-input")!;
  await input.updateComplete;
  await userEvent.fill(input.shadowRoot!.querySelector("textarea")!, text);
  await userEvent.keyboard("{Enter}");
}

it("streams a real composer submission, queues a follow-up and isolates a new conversation", async () => {
  const app = await mount();
  await typeMessage(app, "Explain the Lit library");
  await expect.poll(() => history(app)?.messages[1]?.text.length).toBeGreaterThan(0);
  await typeMessage(app, "Next step");
  await expect.poll(() => composer(app).queuedMessages.length).toBe(1);
  await expect.poll(() => history(app)?.messages.length, { timeout: 6000 }).toBe(4);
  await expect.poll(() => composer(app).running, { timeout: 6000 }).toBe(false);
  expect(history(app)!.messages[3]!.text).toContain("simulated locally");
  expect(composer(app).queuedMessages).toHaveLength(0);
  const newChat = app.shadowRoot!.querySelector<HTMLButtonElement>(
    '[aria-label="New conversation"]',
  )!;
  await userEvent.click(newChat);
  expect(history(app)).toBeNull();
  await typeMessage(app, "Another conversation");
  await expect.poll(() => history(app)?.messages[1]?.text.length).toBeGreaterThan(0);
  const firstChat = app.shadowRoot!.querySelector("tacta-side-bar")!.items.at(-1)!;
  app
    .shadowRoot!.querySelector("tacta-side-bar")!
    .dispatchEvent(new CustomEvent("select-conversation", { detail: firstChat.id }));
  await app.updateComplete;
  expect(history(app)!.messages[0]!.text).toBe("Explain the Lit library");
  expect(history(app)!.messages).toHaveLength(4);
  expect(composer(app).running).toBe(false);
});

it("applies settings through components and recovers after a simulated transport error", async () => {
  const app = await mount();
  await userEvent.click(app.shadowRoot!.querySelector<HTMLButtonElement>("[aria-pressed]")!);
  const theme = app.shadowRoot!.querySelector("tacta-select")!;
  await theme.updateComplete;
  theme.shadowRoot!.querySelector("button")!.focus();
  await userEvent.keyboard("{Enter}{End}{Enter}");
  await app.updateComplete;
  expect(app.shadowRoot!.querySelector(".shell")!.getAttribute("data-tacta-theme")).toBe("light");
  const name = app.shadowRoot!.querySelector("tacta-text-input")!;
  await userEvent.fill(name.shadowRoot!.querySelector("input")!, "Taylor");
  await app.updateComplete;
  expect(app.shadowRoot!.querySelector("h1")!.textContent).toContain("Taylor");
  const checkbox = app.shadowRoot!.querySelector("tacta-checkbox")!;
  await userEvent.click(checkbox.shadowRoot!.querySelector("input")!);
  await typeMessage(app, "Try an error");
  await expect
    .poll(() => app.shadowRoot!.querySelector('[role="alert"]')?.textContent)
    .toContain("demo connection failed");
  expect(composer(app).running).toBe(false);
  await typeMessage(app, "Recover");
  await expect.poll(() => composer(app).running, { timeout: 5000 }).toBe(false);
  expect(app.shadowRoot!.querySelector('[role="alert"]')).toBeNull();
  expect(history(app)!.messages.at(-1)!.text).toContain("simulated locally");
});

it("stops streaming and opens search using the demo's actual controls", async () => {
  const app = await mount();
  await typeMessage(app, "Stop this response");
  await expect.poll(() => history(app)?.messages[1]?.text.length).toBeGreaterThan(0);
  const toolbar = composer(app).shadowRoot!.querySelector("tacta-composer-toolbar")!;
  await toolbar.updateComplete;
  const buttons = [...toolbar.shadowRoot!.querySelectorAll("tacta-chat-send-button")];
  const stopButton = buttons.find((button) => button.stop)!;
  await userEvent.click(stopButton.shadowRoot!.querySelector("button")!);
  await expect.poll(() => composer(app).running).toBe(false);
  const text = history(app)!.messages[1]!.text;
  await userEvent.click(
    app.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label="Search conversations"]')!,
  );
  await app.updateComplete;
  const search = app.shadowRoot!.querySelector("tacta-search-bar")!;
  await search.updateComplete;
  await userEvent.fill(search.shadowRoot!.querySelector("input")!, "Stop this");
  await userEvent.keyboard("{Enter}");
  await app.updateComplete;
  expect(app.shadowRoot!.querySelector("tacta-search-bar")).toBeNull();
  expect(history(app)!.messages[1]!.text).toBe(text);
});
