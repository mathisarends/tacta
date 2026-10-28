# Shared UI audit — 28 October 2026

Read-only reference: `C:/FH/FEP/maximus-trading/frontend/src/shared/ui`.
The source branch reference observed during this pass was
`5805b5e1386ec420f54d726f343d767bbacbfc16`. This describes the inspected working-tree files;
it does not claim that the reference checkout was clean. No source files were changed.

Tacta previously provided 39 registered components. This pass adds **11**, for **50** across the
three existing packages. It also adds a complete Lit consumer example rather than another library
shell that owns application state.

## Components included

| Maximus reference              | Tacta public class / tag                     | Adaptation                                                                                                             |
| ------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `text-input.ts`                | `TextInput` / `tacta-text-input`             | Reimplemented with Shadow DOM and ElementInternals; native form submission, validation, disabled fieldsets and reset   |
| `checkbox/app-checkbox.ts`     | `AppCheckbox` / `tacta-checkbox`             | Encapsulated styling, form association, indeterminate state and typed boolean intent                                   |
| `select/app-select.ts`         | `AppSelect` / `tacta-select`                 | Keyboard/typeahead selection; handles changing options and disabled state                                              |
| `settings/settings-row.ts`     | `SettingsRow` / `tacta-settings-row`         | Named slots and responsive layout                                                                                      |
| `settings/settings-section.ts` | `SettingsSection` / `tacta-settings-section` | Slotted groups and footer                                                                                              |
| `breadcrumb/app-breadcrumb.ts` | `AppBreadcrumb` / `tacta-breadcrumb`         | Removed router prefetching; native links and live default translation                                                  |
| `pill-tabs.ts`                 | `PillTabs` / `tacta-pill-tabs`               | Pill/underline variants, compact select, roving keyboard focus and slotted panels                                      |
| `page-pagination.ts`           | `PagePagination` / `tacta-page-pagination`   | Controlled page intent, boundary disabling, translated status and non-submit buttons                                   |
| `save-indicator.ts`            | `SaveIndicator` / `tacta-save-indicator`     | Display-only state, bounded confirmation timers and disconnect cleanup                                                 |
| `search-bar/search-bar.ts`     | `SearchBar` / `tacta-search-bar`             | Removed router prefetching; native modal, focus restoration, local matching, injected remote results and intent events |
| `search-bar/search-filters.ts` | `SearchFilters` / `tacta-search-filters`     | Keyboard filters and local translations                                                                                |

All implementations live under `packages/core/src`, with package exports, explicit registration,
HTMLElement tag types and standalone styling fallbacks. Styling uses `--tacta-*` tokens.
The existing `chat → core` and `workspace → core` package boundaries remain unchanged.

The application search's responsive dependency is replaced by a local CSS breakpoint; its router
dependency is removed. Text/checkbox components are not copied as light-DOM wrappers that depend on
global application CSS. The existing library tooltip API is retained. Authentication, backend types,
file operations, local storage and application routes do not enter the library.

## Lit consumer example

`examples/chatbot.html` loads `examples/chatbot/chatbot-app.ts`. It composes public package imports,
property bindings and custom event handlers into a working sidebar, conversation history, composer,
queue, search and resizable settings/library panel. The local async generator demonstrates streamed
responses, cancellation and error recovery. No external model or backend is connected.

The visual treatment follows Maximus's neutral dark palette (`#181818`, `#1e1f20`, `#252627`, white
accent) with a neutral light alternative. System typography uses restrained sizes and weights,
consistent line heights and muted secondary information. The earlier green demo accent was removed.

## Remaining candidates

| Area                                                                      | Next extraction boundary                                                                                                                 |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Password field, CTA button, locale switch                                 | Extend the form primitives with explicit form semantics; locale selection must remain application-owned                                  |
| App header, page title, adaptive sections                                 | Extract only layout/slots; retain navigation, responsive app behavior and page data in the consumer                                      |
| Toast                                                                     | Instance-owned notification surface with application-supplied messages and lifecycle; avoid a global app service                         |
| Chat file cards, invoked skills, assistant activity, streaming controller | Review contracts and incremental updates against Tacta's independent message/tool types; do not copy evolving application DTOs wholesale |
| Composer commands, skill tags and queue editing                           | Inject command lists/intent handlers and define draft/queue ownership before adopting the newer behavior                                 |
| Code diff                                                                 | Candidate for a separate optional document package with lazy syntax dependencies                                                         |
| Markdown/source/table/metadata views                                      | Separate rendering/editing from file persistence, autosave and application metadata contracts                                            |
| PDF, Word and spreadsheet previews                                        | Optional viewer package; isolate heavyweight renderers/workers and inject content/loading/errors                                         |
| Image editor and Mermaid                                                  | Optional packages; define renderer lifecycle, export contracts and asset handling first                                                  |
| Browser, terminal and file explorer                                       | Keep remote sessions, RPC, authorization and filesystem operations outside view components                                               |
| Brand mark, heartbeat badge, social login                                 | Brand/product concepts; use slots or injected labels/actions rather than Maximus defaults                                                |

This is an explicit subset of shared UI, not a claim of full synchronization. Document/media editors
and newer chat features remain separate follow-up work with their own contracts and tests.

## Verification

- Strict TypeScript build/typecheck and package dependency/cycle checks.
- 46 Chromium tests pass, covering the existing components, new controls and the real Lit demo flow.
- Production builds include both `index.html` and `chatbot.html`, using built package exports.
- Desktop and 390px mobile layouts inspected in light/dark themes; no browser exceptions or horizontal
  page overflow observed in the demo smoke check.
- Packages remain unpublished; all commits belong to Tacta.
