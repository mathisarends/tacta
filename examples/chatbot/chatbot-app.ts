import { LitElement, html, nothing, unsafeCSS } from "lit";
import tokens from "@tacta/core/tokens.css?inline";
import { state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import "@tacta/core/register";
import "@tacta/chat/register";
import "@tacta/workspace/register";
import type { SearchItem } from "@tacta/core";
import type {
  Message,
  ComposerMessage,
  ComposerOptions,
  ChatModelOption,
  QueuedMessage,
} from "@tacta/chat";
import type { SidebarItem, SidebarRenameDetail } from "@tacta/workspace";
import { streamReply } from "./mock-reply.js";
import { chatbotStyles } from "./chatbot.styles.js";

type Conversation = SidebarItem & { messages: Message[] };
const models: ChatModelOption[] = [
  {
    id: "demo",
    label: "Local demo",
    provider: "demo",
    reasoningEfforts: [],
    defaultReasoningEffort: null,
  },
];
const cards = [
  {
    title: "Core primitives",
    text: "Search, settings, forms and navigation share tokens and DOM events.",
    code: "@tacta/core/register",
  },
  {
    title: "Chat components",
    text: "The composer emits intent. Message history receives immutable updates.",
    code: "@tacta/chat/register",
  },
  {
    title: "Workspace layout",
    text: "Sidebar and split pane compose around your application content.",
    code: "@tacta/workspace/register",
  },
];

/** A consumer app: application state, timers and transport deliberately live outside the library. */
export class TactaChatbotDemo extends LitElement {
  @state() private conversations: Conversation[] = [this.conversation("Getting started")];
  @state() private activeId = this.conversations[0]!.id;
  @state() private running = false;
  @state() private searchOpen = false;
  @state() private panelOpen = false;
  @state() private collapsed = false;
  @state() private theme = "dark";
  @state() private name = "Alex";
  @state() private failNext = false;
  @state() private error = "";
  @state() private options: ComposerOptions = { model: "demo", reasoning: "", access: "default" };
  @state() private queue: (QueuedMessage & { message: ComposerMessage })[] = [];
  @state() private cardPage = 1;
  private run?: AbortController;

  static override styles = [unsafeCSS(tokens), chatbotStyles];

  private conversation(title = "New conversation"): Conversation {
    const id = crypto.randomUUID();
    return { id, title, href: `#${id}`, pinned: false, unread: false, messages: [] };
  }
  private get active(): Conversation {
    return this.conversations.find((item) => item.id === this.activeId)!;
  }
  private get messages(): Message[] {
    return this.active.messages;
  }
  private setMessages(messages: Message[]): void {
    this.conversations = this.conversations.map((item) =>
      item.id === this.activeId ? { ...item, messages } : item,
    );
  }
  private updateMessage(id: string, changes: Partial<Message>): void {
    this.setMessages(
      this.messages.map((message) => (message.id === id ? { ...message, ...changes } : message)),
    );
  }

  override disconnectedCallback(): void {
    this.stop();
    super.disconnectedCallback();
  }

  private stop(): void {
    this.run?.abort();
    this.run = undefined;
    this.running = false;
    this.setMessages(this.messages.map((message) => ({ ...message, startedAt: undefined })));
  }
  private newChat(): void {
    this.stop();
    this.queue = [];
    this.error = "";
    const conversation = this.conversation();
    this.conversations = [conversation, ...this.conversations];
    this.activeId = conversation.id;
  }
  private selectChat(id: string): void {
    if (!this.conversations.some((item) => item.id === id)) {
      return;
    }
    this.stop();
    this.queue = [];
    this.error = "";
    this.activeId = id;
  }
  private removeChat(id: string): void {
    if (id === this.activeId) {
      this.stop();
      this.queue = [];
      this.error = "";
    }
    this.conversations = this.conversations.filter((item) => item.id !== id);
    if (!this.conversations.length) {
      const conversation = this.conversation();
      this.conversations = [conversation];
    }
    if (id === this.activeId) {
      this.activeId = this.conversations[0]!.id;
    }
  }
  private rename(event: CustomEvent<SidebarRenameDetail>): void {
    this.conversations = this.conversations.map((item) =>
      item.id === event.detail.id ? { ...item, title: event.detail.title } : item,
    );
  }
  private pin(id: string): void {
    this.conversations = this.conversations.map((item) =>
      item.id === id ? { ...item, pinned: !item.pinned } : item,
    );
  }

  private async send(message: ComposerMessage): Promise<void> {
    if (this.running) {
      return;
    }
    const run = new AbortController();
    this.run = run;
    const fail = this.failNext;
    this.failNext = false;
    this.error = "";
    this.running = true;
    const id = crypto.randomUUID();
    const startedAt = Date.now();
    const timestamp = new Date().toISOString();
    if (!this.messages.length) {
      this.conversations = this.conversations.map((item) =>
        item.id === this.activeId
          ? { ...item, title: message.text.slice(0, 38) || "Attachments" }
          : item,
      );
    }
    this.setMessages([
      ...this.messages,
      {
        id: crypto.randomUUID(),
        role: "human",
        text: message.text,
        attachments: message.attachments,
        timestamp,
      },
      { id, role: "assistant", text: "", timestamp, startedAt },
    ]);
    let text = "";
    try {
      for await (const chunk of streamReply(message.text, run.signal, fail)) {
        if (this.run !== run) {
          return;
        }
        text += chunk;
        this.updateMessage(id, { text });
      }
    } catch (error) {
      if (!run.signal.aborted) {
        this.error = error instanceof Error ? error.message : "Unable to respond.";
      }
    } finally {
      if (this.run === run) {
        this.updateMessage(id, {
          startedAt: undefined,
          workedSeconds: Math.round((Date.now() - startedAt) / 1000),
        });
        this.running = false;
        this.run = undefined;
        const next = this.queue[0];
        if (next && !this.error) {
          this.queue = this.queue.slice(1);
          void this.send(next.message);
        }
      }
    }
  }
  private enqueue(event: CustomEvent<ComposerMessage>): void {
    const message = event.detail;
    this.queue = [
      ...this.queue,
      {
        id: crypto.randomUUID(),
        text: message.text,
        model: message.model,
        reasoning: message.reasoning,
        message,
      },
    ];
    const composer = this.renderRoot.querySelector("tacta-chat-composer");
    if (composer) {
      composer.value = "";
    }
  }
  private sendQueued(id: string): void {
    const entry = this.queue.find((item) => item.id === id);
    if (!entry) {
      return;
    }
    this.queue = this.queue.filter((item) => item.id !== id);
    this.stop();
    void this.send(entry.message);
  }
  private chooseSearch(event: CustomEvent<SearchItem>): void {
    this.searchOpen = false;
    if (event.detail.action === "new") {
      this.newChat();
    } else if (event.detail.id) {
      this.selectChat(event.detail.id);
    }
  }

  private renderWelcome() {
    return html`<section class="welcome">
      <span class="eyebrow">A workspace for your ideas</span>
      <h1>Good morning, ${this.name || "there"}.<br />What are we building?</h1>
      <p class="intro">
        Start a conversation, explore an idea, or see how a few well-made components fit together.
      </p>
      <div class="suggestions">
        <button
          class="suggestion"
          @click=${() => void this.send({ ...this.options, text: "How do I build with Lit and Tacta?", attachments: [] })}
        >
          Explore the library <span>See how the components connect ↗</span>
        </button>
        <button
          class="suggestion"
          @click=${() => void this.send({ ...this.options, text: "Help me plan a new project", attachments: [] })}
        >
          Make a plan <span>Turn a first idea into small steps ↗</span>
        </button>
      </div>
    </section>`;
  }

  private renderPanel() {
    const card = cards[this.cardPage - 1]!;
    return html`<aside slot="panel" class="inspector">
      <span class="eyebrow">Your workspace</span>
      <h2>Make it yours.</h2>
      <p>A working composition of Tacta's public components.</p>
      <tacta-pill-tabs
        label="Workspace sections"
        .tabs=${[
          { id: "settings", label: "Settings" },
          { id: "library", label: "Library" },
        ]}
      >
        <div slot="settings">
          <tacta-settings-section
            heading="Preferences"
            description="Changes apply to this demo session."
          >
            <tacta-settings-row heading="Your name"
              ><tacta-text-input
                label="Display name"
                .value=${this.name}
                @value-change=${(event: CustomEvent<string>) => {
                  this.name = event.detail;
                }}
              ></tacta-text-input
            ></tacta-settings-row>
            <tacta-settings-row heading="Appearance" inline
              ><tacta-select
                slot="control"
                label="Theme"
                .value=${this.theme}
                .options=${[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                ]}
                @value-change=${(event: CustomEvent<string>) => {
                  this.theme = event.detail;
                }}
              ></tacta-select
            ></tacta-settings-row>
            <tacta-settings-row
              heading="Try an error"
              description="The next response will fail. Send again to recover."
              ><tacta-checkbox
                label="Fail next response"
                .checked=${this.failNext}
                @checked-change=${(event: CustomEvent<boolean>) => {
                  this.failNext = event.detail;
                }}
              ></tacta-checkbox
            ></tacta-settings-row>
          </tacta-settings-section>
        </div>
        <div slot="library" class="stack">
          <div class="component-card">
            <h3>${card.title}</h3>
            <p>${card.text}</p>
            <p><code>${card.code}</code></p>
          </div>
          <tacta-page-pagination
            .page=${this.cardPage}
            .pageCount=${cards.length}
            @page-change=${(event: CustomEvent<number>) => {
              this.cardPage = event.detail;
            }}
          ></tacta-page-pagination>
          <div class="component-card">
            <h3>Application boundary</h3>
            <p>
              The mock transport, conversation state and queue are implemented in
              <code>examples/chatbot</code>. Replace the async generator with your own backend.
            </p>
          </div>
          <a href="/">Open the component playground ↗</a>
        </div>
      </tacta-pill-tabs>
    </aside>`;
  }

  override render() {
    return html`<div class="shell" data-tacta-theme=${this.theme}>
      <tacta-side-bar
        .items=${this.conversations}
        .activeId=${this.activeId}
        .userName=${this.name}
        .collapsed=${this.collapsed}
        @new-chat=${this.newChat}
        @open-search=${() => {
          this.searchOpen = true;
        }}
        @select-conversation=${(event: CustomEvent<string>) => this.selectChat(event.detail)}
        @delete-conversation=${(event: CustomEvent<string>) => this.removeChat(event.detail)}
        @toggle-pin=${(event: CustomEvent<string>) => this.pin(event.detail)}
        @rename-conversation=${this.rename}
        @close-sidebar=${() => {
          this.collapsed = true;
        }}
        @open-sidebar=${() => {
          this.collapsed = false;
        }}
        @sign-out=${() => {
          this.stop();
          this.conversations = [this.conversation()];
          this.activeId = this.conversations[0]!.id;
          this.queue = [];
          this.error = "";
        }}
      >
        <span slot="brand" class="brand"
          ><span class="brand-mark">t</span>${this.collapsed ? nothing : "tacta"}</span
        >
      </tacta-side-bar>
      <main class="workspace">
        <header>
          <tacta-breadcrumb
            .items=${[{ label: "Workspace" }, { label: this.active.title }]}
          ></tacta-breadcrumb>
          <div class="header-actions">
            <span class="badge">Local demo</span>
            <button class="icon-button" aria-label="New conversation" @click=${this.newChat}>
              ＋
            </button>
            <button
              class="icon-button"
              aria-label="Search conversations"
              @click=${() => {
                this.searchOpen = true;
              }}
            >
              ⌕
            </button>
            <button
              class="button"
              aria-pressed=${this.panelOpen}
              @click=${() => {
                this.panelOpen = !this.panelOpen;
              }}
            >
              Workspace
            </button>
          </div>
        </header>
        <tacta-split-pane .collapsed=${!this.panelOpen} value="350" min-width="280" reserve="320">
          <div class="chat">
            ${this.messages.length ? html`<tacta-chat-message-list .messages=${this.messages} .conversationId=${this.activeId} .sending=${this.running}></tacta-chat-message-list>` : this.renderWelcome()}
            ${this.error ? html`<div class="error" role="alert">${this.error}</div>` : nothing}
            <div class="composer">
              ${keyed(
                this.activeId,
                html`<tacta-chat-composer
                  .models=${models}
                  .options=${this.options}
                  .running=${this.running}
                  .context=${this.activeId}
                  .queuedMessages=${this.queue}
                  @send-message=${(event: CustomEvent<ComposerMessage>) => void this.send(event.detail)}
                  @stop-run=${this.stop}
                  @queue-message=${this.enqueue}
                  @remove-queued=${(event: CustomEvent<string>) => {
                    this.queue = this.queue.filter((item) => item.id !== event.detail);
                  }}
                  @send-queued=${(event: CustomEvent<string>) => this.sendQueued(event.detail)}
                  @steer-queued=${(event: CustomEvent<string>) => this.sendQueued(event.detail)}
                  @options-change=${(event: CustomEvent<ComposerOptions>) => {
                    this.options = event.detail;
                  }}
                ></tacta-chat-composer>`,
              )}
              <p class="footnote">
                Built with Lit + Tacta · Simulated responses · Session stays in memory
              </p>
            </div>
          </div>
          ${this.renderPanel()}
        </tacta-split-pane>
      </main>
      ${
        this.searchOpen
          ? html`<tacta-search-bar
              .conversations=${this.conversations}
              .current=${this.active.href}
              .actions=${[{ label: "New conversation", action: "new", group: "actions", icon: "newChat" }]}
              @search-action=${this.chooseSearch}
              @close-search=${() => {
                this.searchOpen = false;
              }}
            ></tacta-search-bar>`
          : nothing
      }
    </div>`;
  }
}

customElements.define("tacta-chatbot-demo", TactaChatbotDemo);
