# Tacta

Composable UI components for agent applications, built with Lit and standard Web Components.
**A small core; install the extensions you need.** Your application owns data, execution,
transport, routing and persistence.

## Components

The question component, used independently of chat:

![Question component](docs/media/question.png)

[Watch choices and free-text answers](docs/media/question-workflow.mp4).

| Package                    | Includes                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@tacta/core`              | Tokens, locale, icons, keyboard helpers, modal, segmented tabs and loading states. **Lit is its only runtime dependency.**                       |
| `@tacta/chat`              | Human/assistant messages, streaming history, tools, attachments, composer, slash commands, model/provider picker, reasoning, approvals and queue |
| `@tacta/question`          | Standalone questions, choices, free text, skip and dismiss                                                                                       |
| `@tacta/workspace-panel`   | Tabs, drag/reorder, configurable surfaces, picker, split pane and resize handles                                                                 |
| `@tacta/terminal`          | xterm, output search, interactive sessions and read-only agent output                                                                            |
| `@tacta/browser`           | Address/navigation, remote video, viewport sizing, keyboard, pointer and clipboard input                                                         |
| `@tacta/sidebar`           | Conversations, pin/rename/delete menus, navigation and user profile                                                                              |
| `@tacta/voice-input`       | Dictation with an injectable speech-recognition adapter                                                                                          |
| `@tacta/image-editor`      | Drawing, text, eraser, colors, undo/redo, zoom and PNG export                                                                                    |
| `@tacta/file-preview`      | Lazy PDF, DOCX, spreadsheet and media viewers                                                                                                    |
| `@tacta/file-explorer`     | Filterable file tree, breadcrumbs, document tabs, toolbar and slotted document workspace                                                         |
| `@tacta/markdown`          | Sanitized Markdown and lazy syntax highlighting                                                                                                  |
| `@tacta/markdown-document` | CodeMirror source/Markdown editor and live preview                                                                                               |
| `@tacta/code-diff`         | Highlighted diff hunks                                                                                                                           |
| `@tacta/controls`          | Inputs, password field, checkbox, select, locale control, tabs, settings rows and sections                                                       |
| `@tacta/settings`          | Controlled profile, plugin, prompt-template and approval-settings views                                                                          |
| `@tacta/search`            | Action and conversation search                                                                                                                   |
| `@tacta/notifications`     | Toasts with configurable, independent stores                                                                                                     |
| `@tacta/workspace`         | Compatibility facade for workspace-panel and sidebar                                                                                             |

Heavy dependencies belong to their extensions. Installing core or question does not install
xterm, document parsers or CodeMirror. [Choose packages and their dependencies](docs/installation.md).

## Use

Packages are not published yet. Build and pack them locally:

```sh
npm ci
npm run pack:packages
```

Install the core and question archives in your application:

```sh
npm install /path/to/tacta-core-0.1.0.tgz /path/to/tacta-question-0.1.0.tgz
```

```ts
import "@tacta/core/tokens.css";
import "@tacta/question/register";
import type { ComposerQuestionResponse } from "@tacta/question";

const question = document.createElement("tacta-composer-question");
question.question = {
  id: "review",
  prompt: "How should I present the review?",
  options: [{ id: "brief", label: "A short summary" }],
};
question.addEventListener("question-response", (event) => {
  const response = (event as CustomEvent<ComposerQuestionResponse>).detail;
  // Handle the response in your application.
});
document.body.append(question);
```

Package roots export classes without registration side effects. Import `register` explicitly,
or use the `define` registration functions with compatible subclasses. Components accept typed
properties and emit DOM events, so the same elements work with Lit and other frameworks.

## Component recordings

Terminal input and output search, cropped to the terminal:

[![Terminal workflow](docs/media/terminal-workflow.gif)](docs/media/terminal-workflow.mp4)

Image annotations, undo/redo and PNG export:

[![Image editor](docs/media/image-editor.png)](docs/media/image-annotations.mp4)

These captures use actual Tacta components with local fixture data and adapters. They contain no
showcase website. [All screenshots, recordings and reproduction instructions](docs/media.md).

## Documentation

- [Extension catalog and usage guides](docs/README.md)
- [Installation and package dependencies](docs/installation.md)
- [Composition, custom surfaces, themes and localization](docs/composition.md)
- [Maximus feature coverage and source provenance](docs/maximus-parity.md)

All public tokens use `--tacta-*`. Light/dark regions, slots, CSS parts and presentation callbacks
let applications supply their own styling and behavior. Terminal and browser use typed connectors;
the library imports no Maximus API, authentication or runtime client.

## Develop

Node 22.12+ and npm:

```sh
npm ci
npm run build
npm exec playwright install chromium
npm test
npm run typecheck
npm run check:architecture
npm run build:examples
npm run format:check
```

UI implementations are adapted from Maximus `origin/main` at
`e2d2e3f730b2ec9dba40ed17d8339961d04d6a5b`. Source application files remain unchanged.
Tacta is standalone, MIT licensed, and does not deploy or publish an application.
