import { html, render, type LitElement, type TemplateResult } from "lit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { setLocale } from "@tacta/core/i18n";
import type { AppModal, SegmentedTabs } from "@tacta/core";
import type {
  AssistantMessage,
  ChatComposer,
  ChatMessageList,
  HumanMessage,
  Message,
  ModelMenu,
  ToolCall,
  ToolCallList,
  VoiceInput,
} from "@tacta/chat";
import type { BrowserSpeechRecognition } from "@tacta/chat/voice-input/speech-session";
import type { SideBar, TactaSplitPane, WorkspaceTabBar } from "@tacta/workspace";
import "@tacta/core/register";
import "@tacta/chat/register";
import "@tacta/workspace/register";

beforeEach(() => setLocale("en"));
afterEach(() => {
  document.body.replaceChildren();
  setLocale("en");
});

async function settle(element: LitElement): Promise<void> {
  await element.updateComplete;
  for (const child of element.renderRoot.querySelectorAll<LitElement>("*")) {
    if ("updateComplete" in child) {
      await settle(child);
    }
  }
}

async function mount<T extends LitElement>(template: TemplateResult, tag: string): Promise<T> {
  const host = document.createElement("div");
  document.body.append(host);
  render(template, host);
  const element = host.querySelector<T>(tag)!;
  await settle(element);
  return element;
}

function query<T extends HTMLElement = HTMLElement>(element: LitElement, selector: string): T {
  const result = element.renderRoot.querySelector<T>(selector);
  if (!result) {
    throw new Error(`Missing ${selector} in ${element.localName}`);
  }
  return result;
}

const call: ToolCall = {
  id: "tool-1",
  name: "custom_probe",
  kind: "tool",
  inputPreview: '{"query":"<img src=x onerror=alert(1)>"}',
  resultPreview: '{"answer":42}',
  status: "completed",
  startedAt: "2026-10-13T10:00:00Z",
  completedAt: "2026-10-13T10:00:01Z",
  durationSeconds: 1,
};
const message: Message = {
  id: "message-1",
  role: "human",
  text: "Hello **world**",
  timestamp: "2026-10-13T10:00:00Z",
};
const models = [
  {
    id: "alpha",
    label: "Alpha",
    provider: "local",
    reasoningEfforts: ["low", "high"],
    defaultReasoningEffort: "high",
  },
  {
    id: "beta",
    label: "Beta",
    provider: "local",
    reasoningEfforts: ["low"],
    defaultReasoningEffort: "low",
  },
];

it("renders message markdown and removes active HTML", async () => {
  const element = await mount<HumanMessage>(
    html`<tacta-human-message
      .message=${{
        ...message,
        text: "Hello **world** <script>alert(1)</script><img src=x onerror=alert(1)>",
      }}
    ></tacta-human-message>`,
    "tacta-human-message",
  );
  expect(query(element, "strong").textContent).toBe("world");
  expect(element.renderRoot.querySelector("script")).toBeNull();
  expect(element.renderRoot.querySelector("img")?.getAttribute("onerror")).toBeNull();
});

it("updates an assistant from working through streamed text to completion", async () => {
  const element = await mount<AssistantMessage>(
    html`<tacta-assistant-message
      .message=${{
        ...message,
        role: "assistant",
        text: "",
        startedAt: Date.now() - 5000,
      }}
    ></tacta-assistant-message>`,
    "tacta-assistant-message",
  );
  expect(query(element, '[role="status"]').getAttribute("aria-label")).toBe("Working");
  expect(element.renderRoot.querySelector(".working-mark circle")).not.toBeNull();
  element.message = { ...element.message, text: "Streamed **answer**" };
  await settle(element);
  expect(query(element, "strong").textContent).toBe("answer");
  element.message = { ...message, role: "assistant", text: "Finished", workedSeconds: 5 };
  await settle(element);
  expect(element.renderRoot.querySelector(".working")).toBeNull();
  expect(query(element, ".body").textContent).toContain("Finished");
});

it("renders generic tool details and honors supplied activity presentation", async () => {
  const element = await mount<ToolCallList>(
    html`<tacta-tool-call-list
      .toolCalls=${[
        {
          ...call,
          status: "running",
        },
      ]}
      working
    ></tacta-tool-call-list>`,
    "tacta-tool-call-list",
  );
  expect(query(element, ".list-title").textContent).toBe("Custom probe");
  const generic = element.presentCall;
  element.presentCall = (value) => ({ ...generic(value), activity: "Inspecting a custom source" });
  await settle(element);
  expect(query(element, ".list-title").textContent).toBe("Inspecting a custom source");
  query<HTMLButtonElement>(element, ".list-toggle").click();
  await settle(element);
  const item = query<LitElement>(element, "tacta-tool-call-item");
  query<HTMLButtonElement>(item, ".summary").click();
  await settle(item);
  const detail = query<LitElement>(item, "tacta-tool-call-detail");
  expect(detail.renderRoot.textContent).toContain("<img src=x onerror=alert(1)>");
  expect(detail.renderRoot.querySelector("img")).toBeNull();
});

it("composes message history and emits history requests without a transport", async () => {
  const element = await mount<ChatMessageList>(
    html`<tacta-chat-message-list
      style="display:block;height:400px;width:700px"
      .messages=${[message, { ...message, id: "reply", role: "assistant", text: "Reply" }]}
      hasMoreHistory
    ></tacta-chat-message-list>`,
    "tacta-chat-message-list",
  );
  expect(element.renderRoot.querySelector("tacta-human-message")).not.toBeNull();
  expect(element.renderRoot.querySelector("tacta-assistant-message")).not.toBeNull();
  const load = vi.fn();
  element.addEventListener("load-older", load);
  query<HTMLButtonElement>(element, ".history-button").click();
  expect(load).toHaveBeenCalledOnce();
});

it("filters the model picker and returns a selected model through a composed event", async () => {
  const element = await mount<ModelMenu>(
    html`<tacta-model-menu .models=${models} value="alpha"></tacta-model-menu>`,
    "tacta-model-menu",
  );
  const setting = vi.fn();
  document.body.addEventListener("setting-change", setting, { once: true });
  const trigger = query<HTMLButtonElement>(element, ".trigger");
  await userEvent.click(trigger);
  await expect.poll(() => query(element, ".menu").matches(":popover-open")).toBe(true);
  const search = query<HTMLInputElement>(element, "input");
  search.value = "Beta";
  search.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
  await settle(element);
  expect(element.renderRoot.querySelectorAll(".model")).toHaveLength(1);
  const option = query<HTMLButtonElement>(element, ".model");
  option.focus();
  await userEvent.keyboard("{Enter}");
  expect(setting.mock.calls[0]![0].detail).toEqual({ key: "model", value: "beta" });
  expect(setting.mock.calls[0]![0].composed).toBe(true);
  expect(element.shadowRoot!.activeElement).toBe(trigger);
});

it("allows custom provider grouping without assuming an agent runtime", async () => {
  const element = await mount<ModelMenu>(
    html`<tacta-model-menu .models=${models}></tacta-model-menu>`,
    "tacta-model-menu",
  );
  element.providerInfo = (id) => ({ id, label: "Private models", name: "Local provider" });
  await settle(element);
  query<HTMLButtonElement>(element, ".trigger").click();
  await expect.poll(() => element.renderRoot.textContent).toContain("Local provider");
});

it("sends typed composer data with Enter, clears accepted drafts and retains rejected drafts", async () => {
  const element = await mount<ChatComposer>(
    html`<tacta-chat-composer
      .models=${models}
      .options=${{ model: "alpha", reasoning: "high", access: "default" }}
      .value=${"Hello"}
    ></tacta-chat-composer>`,
    "tacta-chat-composer",
  );
  const send = vi.fn();
  element.addEventListener("send-message", send);
  const input = query<LitElement>(element, "tacta-composer-dropzone").querySelector<LitElement>(
    "tacta-composer-input",
  )!;
  const textarea = query<HTMLTextAreaElement>(input, "textarea");
  textarea.focus();
  await userEvent.keyboard("{Enter}");
  await settle(element);
  expect(send.mock.calls[0]![0].detail).toMatchObject({
    text: "Hello",
    model: "alpha",
    attachments: [],
  });
  expect(element.value).toBe("");
  element.value = "Keep this";
  element.addEventListener("send-message", (event) => event.preventDefault(), { once: true });
  await settle(element);
  textarea.focus();
  await userEvent.keyboard("{Enter}");
  expect(element.value).toBe("Keep this");
});

it("requests queueing while running and preserves the draft", async () => {
  const element = await mount<ChatComposer>(
    html`<tacta-chat-composer running .value=${"Later"}></tacta-chat-composer>`,
    "tacta-chat-composer",
  );
  const queued = vi.fn();
  element.addEventListener("queue-message", queued);
  const dropzone = query<LitElement>(element, "tacta-composer-dropzone");
  const input = dropzone.querySelector<LitElement>("tacta-composer-input")!;
  query<HTMLTextAreaElement>(input, "textarea").focus();
  await userEvent.keyboard("{Enter}");
  expect(queued.mock.calls[0]![0].detail.text).toBe("Later");
  expect(element.value).toBe("Later");
});

it("renders a sidebar with a consumer brand slot and emits navigation intent", async () => {
  const element = await mount<SideBar>(
    html`<tacta-side-bar
      newChatHref="/new"
      .entries=${[{ name: "workspace", href: "/workspace", label: "Workspace", icon: "folder" }]}
      .items=${[{ id: "1", title: "A conversation", href: "/chat/1", pinned: false, unread: true }]}
    >
      <strong slot="brand">My product</strong>
    </tacta-side-bar>`,
    "tacta-side-bar",
  );
  const brand = query<HTMLSlotElement>(element, 'slot[name="brand"]');
  expect(brand.assignedElements()[0]?.textContent).toBe("My product");
  const navigate = vi.fn();
  element.addEventListener("navigate", navigate);
  query<HTMLAnchorElement>(element, 'a[href="/workspace"]').click();
  expect(navigate.mock.calls[0]![0].detail).toBe("/workspace");
  element.collapsed = true;
  await settle(element);
  expect(getComputedStyle(query(element, ".groups")).display).toBe("none");
});

it("renames sidebar rows through a native accessible dialog", async () => {
  const item = { id: "1", title: "First", href: "/chat/1", pinned: false, unread: false };
  const element = await mount<SideBar>(
    html`<tacta-side-bar .items=${[item]}></tacta-side-bar>`,
    "tacta-side-bar",
  );
  const row = query<LitElement>(element, "tacta-conversation-row");
  row.dispatchEvent(
    new CustomEvent("rename-request", { detail: item, bubbles: true, composed: true }),
  );
  await settle(element);
  const dialog = query<LitElement>(element, "tacta-rename-dialog");
  const modal = query<AppModal>(dialog, "tacta-modal");
  expect(query<HTMLDialogElement>(modal, "dialog").open).toBe(true);
  const input = query<HTMLInputElement>(dialog, "input");
  input.value = "Renamed";
  input.dispatchEvent(new InputEvent("input", { bubbles: true }));
  await settle(dialog);
  const rename = vi.fn();
  element.addEventListener("rename-conversation", rename);
  query<HTMLFormElement>(dialog, "form").requestSubmit();
  expect(rename.mock.calls[0]![0].detail).toEqual({ id: "1", title: "Renamed" });
});

it("navigates and closes workspace tabs with the keyboard", async () => {
  const tabs = [
    { id: "a", label: "Browser", surface: "Browser", url: "", favicon: "" },
    { id: "b", label: "Files", surface: "Files", url: "", favicon: "" },
  ];
  const element = await mount<WorkspaceTabBar>(
    html`<tacta-workspace-tab-bar .tabs=${tabs} active="a"></tacta-workspace-tab-bar>`,
    "tacta-workspace-tab-bar",
  );
  const select = vi.fn();
  const close = vi.fn();
  element.addEventListener("tab-select", select);
  element.addEventListener("tab-close", close);
  query(element, '[role="tab"]').focus();
  await userEvent.keyboard("{ArrowRight}");
  await settle(element);
  expect(select.mock.calls[0]![0].detail).toBe("b");
  await userEvent.keyboard("{Delete}");
  expect(close.mock.calls[0]![0].detail).toBe("b");
});

it("composes slotted split panes and updates their width through keyboard resize", async () => {
  const element = await mount<TactaSplitPane>(
    html`<tacta-split-pane style="width:1000px;height:300px" value="400">
      <p>Main content</p>
      <p slot="panel">Panel content</p>
    </tacta-split-pane>`,
    "tacta-split-pane",
  );
  const splitter = query<LitElement>(element, "tacta-panel-splitter");
  query(splitter, '[role="separator"]').focus();
  await userEvent.keyboard("{ArrowLeft}");
  await settle(element);
  expect(element.value).toBe(424);
  expect(getComputedStyle(query(element, ".panel")).width).toBe("424px");
  element.collapsed = true;
  await settle(element);
  expect(query(element, ".panel").checkVisibility()).toBe(false);
});

it("updates translated controls without browser storage or a page reload", async () => {
  const element = await mount<ModelMenu>(
    html`<tacta-model-menu .models=${models}></tacta-model-menu>`,
    "tacta-model-menu",
  );
  expect(query(element, ".trigger").getAttribute("aria-label")).toBe("Model: Model");
  setLocale("de");
  await settle(element);
  expect(query(element, ".trigger").getAttribute("aria-label")).toBe("Modell: Modell");
});

it("selects slotted segmented panels with keyboard focus", async () => {
  const element = await mount<SegmentedTabs>(
    html`<tacta-segmented-tabs
      .tabs=${[
        { id: "a", label: "One" },
        { id: "b", label: "Two" },
      ]}
    >
      <p slot="a">First panel</p>
      <p slot="b">Second panel</p>
    </tacta-segmented-tabs>`,
    "tacta-segmented-tabs",
  );
  query(element, '[role="tab"]').focus();
  await userEvent.keyboard("{ArrowRight}");
  await settle(element);
  expect(element.active).toBe("b");
  expect(query(element, "#panel-b").checkVisibility()).toBe(true);
  expect(query(element, "#panel-a").checkVisibility()).toBe(false);
});

it("supports an explicit speech boundary and disables unavailable recognition", async () => {
  const element = await mount<VoiceInput>(
    html`<tacta-voice-input .recognitionFactory=${() => undefined}></tacta-voice-input>`,
    "tacta-voice-input",
  );
  expect(query<HTMLButtonElement>(element, "button").disabled).toBe(true);
});

it("aborts injected speech recognition when the voice component disconnects", async () => {
  class Recognition implements BrowserSpeechRecognition {
    static current: Recognition;
    lang = "";
    continuous = false;
    interimResults = false;
    onstart: BrowserSpeechRecognition["onstart"] = null;
    onresult: BrowserSpeechRecognition["onresult"] = null;
    onerror: BrowserSpeechRecognition["onerror"] = null;
    onend: BrowserSpeechRecognition["onend"] = null;
    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();
    constructor() {
      Recognition.current = this;
    }
  }
  const element = await mount<VoiceInput>(
    html`<tacta-voice-input .recognitionFactory=${() => Recognition}></tacta-voice-input>`,
    "tacta-voice-input",
  );
  query<HTMLButtonElement>(element, "button").click();
  expect(Recognition.current.lang).toBe("en-US");
  element.remove();
  expect(Recognition.current.abort).toHaveBeenCalledOnce();
  expect(Recognition.current.onresult).toBeNull();
});
