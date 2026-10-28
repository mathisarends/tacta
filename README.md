# Tacta

Reusable UI components for agentic applications. Built with **Lit, TypeScript and standard Web
Components**. Use them in Lit or in another frontend through HTML, properties and DOM events.

Tacta owns presentation and interaction. Applications own authentication, routing, transport,
model execution, file operations and persistence.

## Components

| Package            | Available components                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tacta/core`      | Dialog, text input, checkbox, select, segmented/pill tabs, breadcrumbs, pagination, search and filters, settings rows/sections, save indicator, spinner, skeleton, icons, tooltips, keyboard helpers, translations and theme tokens     |
| `@tacta/chat`      | Human/assistant messages, streaming message history and navigation, tool calls and details, attachments and image viewer, composer, model picker, provider rail, reasoning/access controls, approvals, questions, queue and voice input |
| `@tacta/workspace` | Sidebar, conversation rows, profile menu, avatar, rename dialog, workspace tabs, surface picker, panel/explorer resize controls and a slotted split pane                                                                                |

The TypeScript implementations are in `packages/<package>/src`. Browser and terminal directories
currently document future extraction; remote session transport stays in the application.

## Develop

Node 22.12+ and npm are required. Node 24 is recommended.

```sh
npm ci
npm run build
npm exec playwright install chromium
npm test
npm run dev
```

The plain HTML playground runs at `http://127.0.0.1:5173`.
The **interactive Lit chatbot** runs at `http://127.0.0.1:5173/chatbot.html`: conversations,
simulated streaming, stop/queue, search, settings, light/dark themes and error recovery.
See [the example guide](examples/chatbot/README.md) for the Lit composition and backend boundary.
`npm run build:examples` builds both entry points. Other checks:

```sh
npm run typecheck
npm run check:architecture
npm run format:check
npm run build:examples
```

## Install

The packages are not published yet. Build and pack them from this repository:

```sh
npm run build
npm pack --workspace @tacta/core
npm pack --workspace @tacta/chat
npm pack --workspace @tacta/workspace
```

Install the generated archives together in your frontend:

```sh
npm install /path/to/tacta-core-0.1.0.tgz /path/to/tacta-chat-0.1.0.tgz /path/to/tacta-workspace-0.1.0.tgz
```

## Use

Register the packages you need. Lit is included as a dependency; consumers do not need to write Lit code.

```ts
import "@tacta/core/tokens.css"; // optional light/dark defaults
import "@tacta/chat/register";
import "@tacta/workspace/register";
```

```html
<tacta-split-pane value="320" reserve="250" min-width="185">
  <tacta-chat-message-list></tacta-chat-message-list>
  <aside slot="panel">Your workspace</aside>
</tacta-split-pane>
<tacta-chat-composer></tacta-chat-composer>
```

Supply object data through properties and handle intent with DOM events:

```ts
import type { ChatComposer, ComposerMessage, ChatMessageList } from "@tacta/chat";

const history = document.querySelector<ChatMessageList>("tacta-chat-message-list")!;
history.messages = [{ id: "1", role: "human", text: "Hello", timestamp: new Date().toISOString() }];

const composer = document.querySelector<ChatComposer>("tacta-chat-composer")!;
composer.models = modelsFromYourApplication;
composer.addEventListener("send-message", (event) => {
  const message = (event as CustomEvent<ComposerMessage>).detail;
  // Your application sends the message and updates history.messages as data arrives.
});
```

In a Lit component, use the same properties and events:

```ts
html`<tacta-chat-composer
  .models=${this.models}
  .options=${this.options}
  .running=${this.running}
  @send-message=${this.sendMessage}
></tacta-chat-composer>`;
```

Package roots and component subpaths export classes without registration side effects. The explicit
`register` entries define tags. The `define` entries expose registration functions for applications
that register compatible subclasses first.

## Customize

All public styling tokens use the `--tacta-` prefix. Scope them to a component or a region:

```css
.workspace {
  --tacta-font-family: system-ui, sans-serif;
  --tacta-color-surface: #f2e8fa;
  --tacta-color-text: #35234b;
  --tacta-color-accent: #7c3aed;
  --tacta-color-focus: #7c3aed;
  --tacta-radius-panel: 12px;
}
tacta-explorer-splitter::part(handle) {
  border-radius: 4px;
}
```

Optional `data-tacta-theme="light"` and `"dark"` regions provide complete defaults. Components also
include fallback styles without the token stylesheet. Use slots for sidebar branding, segmented
panels and split-pane content. Set the locale explicitly with `setLocale("de")` from `@tacta/core`;
Tacta never reads application storage or reloads the page.

Tool UI accepts a `presentCall` callback for application-specific titles and activity text. The
model picker accepts `providerInfo` and `renderProviderIcon` callbacks for provider grouping and
branding. Applications supply model lists; Tacta never loads them from an API.

## Source and independence

The components are ported from existing Maximus UI implementations. Maximus is a **read-only design
reference** and remains unchanged. All development, examples, tests and commits live in this repository.
Tacta imports no Maximus or Vizron modules and contains no application integration scripts.

Use `npm run pack:packages` to build and package all three libraries. See [the migration report](docs/migration-report.md)
for the extraction boundaries and validation. MIT licensed.

The [October 2026 shared UI audit](docs/shared-ui-audit.md) records the additional Maximus components
ported in this pass and the remaining candidates, including larger document/media viewers.
