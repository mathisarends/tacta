# Migration report

Tacta is at `C:/code/tacta` (Git Bash: `/c/code/tacta`). The source is the Maximus Lit frontend at
`C:/FH/FEP/maximus-trading/frontend`, initially audited from commit
`61cc725dbf5cef6374c203e61f5a9003dca6e36d`.

## Extracted UI

| Area                                                                  | Existing Maximus source                                                                       | Tacta destination                      |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| Chat messages, tools, composer, model picker, approvals and questions | `shared/ui/chat/`                                                                             | `packages/chat/src/`                   |
| Message history, streaming layout and navigation                      | `features/chat/chat-message-list.ts`, `chat-message-navigation.ts`, `data/chat-navigation.ts` | `packages/chat/src/`                   |
| Voice input                                                           | `shared/ui/voice-input/`                                                                      | `packages/chat/src/voice-input/`       |
| Sidebar, conversation rows, avatar and profile/rename menus           | `shared/ui/sidebar/`                                                                          | `packages/workspace/src/sidebar/`      |
| Workspace tabs, drag/reorder, surface menu/picker                     | `shared/ui/workspace-panel/`                                                                  | `packages/workspace/src/`              |
| Panel and explorer resizing                                           | Existing panel/explorer splitters                                                             | `packages/workspace/src/`              |
| Slotted split-pane composition                                        | Existing chat's horizontal stage/panel layout                                                 | `packages/workspace/src/split-pane.ts` |
| Dialog, segmented tabs and loading states                             | `shared/ui/app-modal.ts`, `segmented-tabs.ts`, `loading/`                                     | `packages/core/src/`                   |
| Icons, tooltips, menu positioning, keyboard helpers and styles        | Existing shared helpers                                                                       | `packages/core/src/`                   |
| Sanitized markdown and lazy code highlighting                         | `shared/markdown/`                                                                            | `packages/chat/src/markdown/`          |

The expanded library contains 37 registered Web Components. It compiles with strict TypeScript and
has explicit ESM/declaration exports. Its package graph is `chat → core` and `workspace → core`.

## Application boundaries

- Transport, authentication, routes, agent sessions, chat queue execution, file operations and
  persisted preferences remain in Maximus.
- Sidebar navigation consumes plain display entries and emits URLs; it imports no router.
- Brand content uses a sidebar slot. The assistant's working indicator is customizable. The library
  has a neutral default instead of a Maximus logo.
- Tool-name activity mapping stays in Maximus. Tool components accept a typed `presentCall` callback.
- Model lists are supplied by the application. Provider grouping and icons accept callbacks.
- Avatar URL bases are properties. Library components read no Vite API environment variables.
- Library locale state is independent of browser storage and reloads. Maximus synchronizes its locale
  at the integration boundary.
- All design tokens use `--tacta-*`; component CSS includes standalone fallbacks. Default theme CSS
  provides light/dark regions and applications can map their own semantic tokens.
- Registration is explicit. Class imports are side-effect free; registration functions let a host
  application define compatible subclasses before filling the remaining standard tags.

## Integration checkpoints

The first workspace slice is already consumed by Maximus through local package archives. Its original
tags and resize events are preserved by small adapters. The expanded chat/sidebar/tab adoption follows
as a separate commit after the library checkpoint; final validation is recorded with that adoption.

## Validation at the library checkpoint

- Build and strict typecheck passed.
- 32 Chromium component tests passed, covering resize/cancellation, slots, keyboard navigation,
  message streaming, markdown sanitization, custom tool/provider presentation, model selection,
  composer send/cancel/queue behavior, sidebar intent/rename and live translation.
- The previous Maximus workspace integration passed its complete frontend suite: 146 files and
  1,050 tests, plus build, lint, typechecking and formatting.

## Remaining candidates

| Classification       | Existing candidates                                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requires refactoring | Browser navigation/address/viewer, terminal renderer/search, file explorer/editor/preview components                                                     |
| Application-specific | Browser/terminal RPC controllers, generated backend clients, chat turn orchestration, routes, file autosave/deletion and authenticated application shell |

No missing Vizron feature or backend behavior has been introduced. Packages are not published and
applications are not deployed.
