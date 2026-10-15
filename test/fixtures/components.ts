import "@tacta/core/tokens.css";
import type { Message } from "@tacta/chat";
import { createDemoBrowser, createDemoTerminal, sampleImage } from "./adapters.js";

const fixture = document.querySelector<HTMLElement>("#fixture")!;
const name = new URLSearchParams(location.search).get("component") ?? "question";
const events: unknown[] = [];
Object.assign(window, { fixtureEvents: events });
fixture.addEventListener("question-response", (event) =>
  events.push((event as CustomEvent).detail),
);
fixture.addEventListener("send-message", (event) => events.push((event as CustomEvent).detail));

const messages: Message[] = [
  {
    id: "human",
    role: "human",
    text: "Review the workspace changes and summarize the result.",
    timestamp: "2026-10-15T09:00:00Z",
  },
  {
    id: "assistant",
    role: "assistant",
    text: "The changes add an independent terminal and browser panel.\n\n- Each surface retains its session when switching tabs.\n- Closing a tab releases its resources.\n- The application supplies the transport.\n\n```ts\nimport '@tacta/terminal/register';\n```",
    timestamp: "2026-10-15T09:00:01Z",
    workedSeconds: 2,
    toolCalls: [
      {
        id: "read",
        name: "read_file",
        kind: "file",
        inputPreview: '{"path":"src/workspace.ts"}',
        resultPreview: '{"status":"reviewed","changes":3}',
        status: "completed",
        startedAt: "2026-10-15T09:00:00Z",
        completedAt: "2026-10-15T09:00:01Z",
        durationSeconds: 1,
      },
    ],
  },
];

async function mount(): Promise<void> {
  switch (name) {
    case "question": {
      await import("@tacta/question/register");
      fixture.style.width = "640px";
      const question = document.createElement("tacta-composer-question");
      question.id = "component";
      question.question = {
        id: "presentation",
        prompt: "How should I present the review?",
        options: [
          { id: "brief", label: "A short summary of the important changes" },
          { id: "detailed", label: "A detailed explanation with code examples" },
        ],
      };
      fixture.append(question);
      return;
    }
    case "composer": {
      await import("@tacta/chat/register");
      fixture.style.width = "680px";
      fixture.style.paddingTop = "240px";
      const composer = document.createElement("tacta-chat-composer");
      composer.id = "component";
      composer.models = [
        {
          id: "model",
          label: "Your model",
          provider: "Custom",
          reasoningEfforts: ["low", "medium", "high"],
          defaultReasoningEffort: "medium",
        },
      ];
      composer.options = { model: "model", reasoning: "medium", access: "default" };
      composer.commands = [
        {
          command: "review",
          title: "Review changes",
          description: "Explain changes and flag issues",
          kind: "prompt",
          prompt: "Review the code changes.",
        },
        {
          command: "plan",
          title: "Plan implementation",
          description: "Break the work into practical steps",
          kind: "skill",
          prompt: "Create an implementation plan.",
        },
      ];
      fixture.append(composer);
      return;
    }
    case "chat": {
      await import("@tacta/chat/register");
      fixture.style.width = "680px";
      const list = document.createElement("tacta-chat-message-list");
      list.id = "component";
      list.messages = messages;
      list.style.height = "560px";
      fixture.append(list);
      return;
    }
    case "approval": {
      await import("@tacta/chat/register");
      fixture.style.width = "640px";
      const approval = document.createElement("tacta-approval-card");
      approval.id = "component";
      approval.approval = {
        id: "write",
        action: "Write src/workspace.ts",
        reason: "The agent wants to save the updated workspace configuration.",
        expiresAt: null,
        state: "pending",
      };
      fixture.append(approval);
      return;
    }
    case "terminal": {
      await import("@tacta/terminal/register");
      const terminal = document.createElement("tacta-remote-terminal");
      terminal.id = "component";
      terminal.style.height = "400px";
      terminal.connector = createDemoTerminal;
      fixture.append(terminal);
      return;
    }
    case "browser": {
      await import("@tacta/browser/register");
      const browser = document.createElement("tacta-browser-panel");
      browser.id = "component";
      browser.style.height = "460px";
      browser.connector = createDemoBrowser;
      browser.initialUrl = "https://example.com";
      browser.active = true;
      fixture.append(browser);
      return;
    }
    case "image": {
      await import("@tacta/image-editor/register");
      const editor = document.createElement("tacta-image-editor");
      editor.id = "component";
      editor.style.height = "560px";
      editor.src = sampleImage();
      editor.filename = "activity.png";
      editor.attachable = true;
      fixture.append(editor);
      return;
    }
    case "files": {
      await import("@tacta/file-preview/register");
      const preview = document.createElement("tacta-file-preview");
      preview.id = "component";
      preview.style.height = "380px";
      preview.file = {
        path: "activity.csv",
        encoding: "utf-8",
        size: 80,
        content:
          "Day,Requests,Status\nMonday,24,Complete\nTuesday,38,Complete\nWednesday,31,Complete\nThursday,46,Running\nFriday,42,Queued",
      };
      fixture.append(preview);
      return;
    }
    case "editor": {
      await import("@tacta/markdown-document/register");
      const editor = document.createElement("tacta-markdown-editor");
      editor.id = "component";
      editor.style.height = "420px";
      editor.label = "workspace.md";
      editor.live = true;
      editor.value =
        "# Workspace notes\n\n## Sessions\n\n- Keep **terminal** output when switching tabs.\n- Release sessions when a tab closes.\n\n```ts\nimport '@tacta/terminal/register';\n```\n\nThe application owns transport and persistence.";
      fixture.append(editor);
      return;
    }
    case "diff": {
      await import("@tacta/code-diff/register");
      const diff = document.createElement("tacta-code-diff");
      diff.id = "component";
      diff.path = "workspace.ts";
      diff.label = "Workspace changes";
      diff.hunks = [
        {
          oldStart: 1,
          newStart: 1,
          lines: [
            { kind: "removed", oldLine: 1, newLine: null, text: "import './workspace-ui';" },
            {
              kind: "added",
              oldLine: null,
              newLine: 1,
              text: "import '@tacta/workspace-panel/register';",
            },
            {
              kind: "added",
              oldLine: null,
              newLine: 2,
              text: "import '@tacta/terminal/register';",
            },
            { kind: "context", oldLine: 2, newLine: 3, text: "" },
            {
              kind: "context",
              oldLine: 3,
              newLine: 4,
              text: "const panel = document.querySelector('#workspace');",
            },
          ],
        },
      ];
      fixture.append(diff);
      return;
    }
    case "workspace": {
      await import("@tacta/workspace-panel/register");
      const tabs = document.createElement("tacta-workspace-tab-bar");
      tabs.id = "component";
      tabs.active = "terminal";
      tabs.tabs = [
        {
          id: "browser",
          label: "example.com",
          surface: "Browser",
          url: "https://example.com",
          favicon: "",
        },
        { id: "terminal", label: "Terminal", surface: "Terminal", url: "", favicon: "" },
        { id: "notes", label: "notes.md", surface: "Files", url: "", favicon: "" },
      ];
      fixture.append(tabs);
      return;
    }
    case "explorer": {
      await import("@tacta/file-explorer/register");
      fixture.style.width = "320px";
      const explorer = document.createElement("tacta-document-explorer");
      explorer.id = "component";
      explorer.style.height = "400px";
      explorer.active = "notes";
      explorer.entries = [
        { id: "readme", path: "README.md" },
        { id: "notes", path: "docs/notes.md" },
        { id: "config", path: "src/config.ts", dirty: true },
        { id: "package", path: "package.json" },
      ];
      fixture.append(explorer);
      return;
    }
    case "settings": {
      await import("@tacta/controls/register");
      fixture.style.width = "680px";
      const section = document.createElement("tacta-settings-section");
      section.id = "component";
      section.heading = "Workspace preferences";
      section.description = "Configure the controls your application needs.";
      const row = document.createElement("tacta-settings-row");
      row.heading = "Language";
      row.description = "Choose the interface language.";
      const locale = document.createElement("tacta-locale-switch");
      locale.slot = "control";
      locale.expanded = true;
      row.append(locale);
      const reasoning = document.createElement("tacta-settings-row");
      reasoning.heading = "Default reasoning";
      reasoning.description = "Applied when starting a conversation.";
      const select = document.createElement("tacta-app-select");
      select.slot = "control";
      select.label = "Reasoning";
      select.options = [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ];
      select.value = "medium";
      reasoning.append(select);
      section.append(row, reasoning);
      fixture.append(section);
      return;
    }
    case "search": {
      await import("@tacta/search/register");
      const search = document.createElement("tacta-search-bar");
      search.id = "component";
      search.style.position = "relative";
      search.style.inset = "auto";
      search.style.height = "440px";
      search.actions = [
        {
          label: "New conversation",
          action: "new",
          href: "#new",
          group: "actions",
          icon: "newChat",
        },
        {
          label: "Open terminal",
          action: "terminal",
          href: "#terminal",
          group: "actions",
          icon: "terminal",
        },
      ];
      search.conversations = [{ id: "review", title: "Review workspace changes", href: "#review" }];
      fixture.append(search);
      return;
    }
    case "sidebar": {
      await import("@tacta/sidebar/register");
      fixture.style.width = "280px";
      const sidebar = document.createElement("tacta-side-bar");
      sidebar.id = "component";
      sidebar.style.height = "520px";
      sidebar.userName = "Alex";
      sidebar.activeId = "review";
      sidebar.newChatHref = "#new";
      sidebar.items = [
        {
          id: "review",
          title: "Review workspace changes",
          href: "#review",
          pinned: true,
          unread: false,
        },
        { id: "plan", title: "Plan the next feature", href: "#plan", pinned: false, unread: true },
      ];
      fixture.append(sidebar);
      return;
    }
    case "notifications": {
      await import("@tacta/notifications/register");
      const { ToastStore } = await import("@tacta/notifications");
      fixture.style.width = "380px";
      const store = new ToastStore();
      const region = document.createElement("tacta-toast-region");
      region.id = "component";
      region.style.position = "relative";
      region.style.inset = "auto";
      region.store = store;
      fixture.append(region);
      store.add("success", "Changes saved", {
        description: "Workspace configuration is up to date.",
        duration: Infinity,
      });
      return;
    }
  }
}
await mount();
document.documentElement.dataset.ready = "true";
