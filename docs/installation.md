# Installation

Packages are not published to npm yet. Build the repository and pack the libraries:

```sh
npm ci
npm run build
npm run pack:packages
```

Install only the archives you need and their Tacta dependencies in your application.
For a standalone question UI:

```sh
npm install /path/to/tacta-core-0.1.0.tgz /path/to/tacta-question-0.1.0.tgz
```

```ts
import "@tacta/core/tokens.css";
import "@tacta/question/register";

const question = document.createElement("tacta-composer-question");
question.question = {
  id: "review",
  prompt: "How detailed should the review be?",
  options: [{ id: "brief", label: "A short summary" }],
};
document.body.append(question);
```

There is no extension loader that downloads everything. npm resolves dependencies;
your imports decide which elements are registered. A core-only application installs
Lit and the core package. It does not install xterm, CodeMirror, PDF.js, SheetJS or Word parsing.

| Install                                                                                          | Additional Tacta archives             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Core                                                                                             | None                                  |
| Question, terminal, browser, sidebar, voice-input, controls, search, notifications, image-editor | Core                                  |
| Workspace panel                                                                                  | Core                                  |
| Chat                                                                                             | Core, question, voice-input, markdown |
| File explorer                                                                                    | Core, workspace-panel                 |
| File preview                                                                                     | Core, image-editor                    |
| Code diff                                                                                        | Core                                  |
| Markdown document                                                                                | Core, markdown                        |
| Settings                                                                                         | Core, controls, sidebar               |
| Workspace compatibility facade                                                                   | Core, workspace-panel, sidebar        |

Third-party dependencies are declared by each package and installed by npm.
File preview uses Vite-compatible `?url` and `?worker` imports for PDF and spreadsheet workers;
configure equivalent worker/asset handling if using another bundler. Other components ship ESM
and declarations without application aliases or environment variables.

## Registration

Package roots and component subpaths export classes without registering tags:

```ts
import { ComposerQuestion } from "@tacta/question";
customElements.define("my-question", class extends ComposerQuestion {});
```

`@tacta/<package>/register` registers the package's standard tags. `define` exports an
idempotent registration function, useful when supplying compatible subclasses first.
Markdown is a rendering utility and has no registration entry.

## Development

Node 22.12+ and npm are required.

```sh
npm run build
npm run typecheck
npm run check:architecture
npm exec playwright install chromium
npm test
npm run build:examples
npm run format:check
```

The existing `examples/` folder contains simple splitter examples. Internal component
fixtures in `test/fixtures/` exist for browser verification and documentation captures;
they are not a showcase website or part of the published packages.
