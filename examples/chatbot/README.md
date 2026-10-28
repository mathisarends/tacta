# Lit chatbot

A runnable consumer of `@tacta/core`, `@tacta/chat` and `@tacta/workspace`, inspired by the Maximus
workspace. The app itself is a Lit Web Component. It imports only the libraries' public package
entries and never reaches into their `src` directories.

From the repository root:

```sh
npm ci
npm run build
npm run dev
```

Open **http://127.0.0.1:5173/chatbot.html**. `npm run build:examples` builds both the HTML playground
and this app into `examples/dist`. No account, API key or backend is required.

Try typing a message, queuing a follow-up while it streams, stopping it, starting another
conversation, searching history, pinning/renaming/deleting a chat, and opening Workspace.
The settings panel changes the theme and name and can fail the next response to demonstrate recovery.
On small screens the header's new-chat and search controls provide access to conversations.

## Composition

Workspace opens a Maximus-style surface picker and tab strip. Open Browser, Terminal and Files
from the picker or the + menu; select, reorder and close tabs, or maximize/restore the panel.
Preferences are available separately above the surface content. Browser displays a sandboxed local
document, Terminal sample output, and Files selectable sample documents. These previews do not
connect to remote browser sessions, execute commands or access the filesystem.

| File                | Responsibility                                                        |
| ------------------- | --------------------------------------------------------------------- |
| `chatbot-app.ts`    | Lit state, conversation lifecycle, queue and component event handlers |
| `mock-reply.ts`     | Cancellable async generator simulating response chunks and failure    |
| `chatbot.styles.ts` | App layout and responsive composition using Tacta tokens              |
| `main.ts`           | Optional theme stylesheet and example registration                    |

The shell composes `tacta-side-bar`, `tacta-breadcrumb` and `tacta-split-pane`. The chat uses
`tacta-chat-message-list` and `tacta-chat-composer`. Search, tabs, settings rows/sections, text input,
checkbox, select and pagination are real library components, not duplicate app implementations.
The theme tokens are also included inside the app's shadow root to support scoped light/dark regions.

The basic Lit contract is:

```ts
html`<tacta-chat-message-list
    .messages=${this.messages}
    .conversationId=${this.activeId}
    .sending=${this.running}
  ></tacta-chat-message-list>
  <tacta-chat-composer
    .models=${this.models}
    .running=${this.running}
    @send-message=${(event: CustomEvent<ComposerMessage>) => this.send(event.detail)}
    @stop-run=${this.stop}
  ></tacta-chat-composer>`;
```

Use dot bindings for arrays/objects and `@event` bindings for user intent. Update message arrays and
objects immutably so Lit notices new chunks. `keyed(activeId, ...)` gives each selected conversation a
fresh composer. Switching conversations stops the active run and clears its pending queue; completed
history remains available. The application guards late responses with the run's identity and aborts
timers on disconnect.

## Connect a backend

Replace `streamReply(prompt, signal, fail)` with an async generator that yields chunks from your
transport and observes `AbortSignal`. Keep network requests, credentials, session IDs and persistence
in your application. Populate the model options from your service and handle errors at that boundary.
The library needs only plain display data and DOM events.

The demo keeps everything in memory and uses deterministic canned text. Attached files are shown as
local message attachments; they are not uploaded or interpreted. The access selector demonstrates
composer state only; there is no agent execution or approval backend. The profile menu's sign-out
intent resets the demo session. Voice input uses the existing browser-dependent library control.

Tests in `test/chatbot-demo.test.ts` exercise the real composer, streaming/queue, conversation switching,
stop/search, settings and error recovery. Run `npm test` after installing Playwright Chromium.
