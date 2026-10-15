# Maximus UI coverage

Reference: fetched `origin/main` at `e2d2e3f730b2ec9dba40ed17d8339961d04d6a5b`
on 15 October 2026. Files were read from the committed tree, not from potentially
uncommitted application files. Maximus source files are unchanged.

| Maximus UI area                                                                      | Tacta implementation        | Host integration                                                          |
| ------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------- |
| Messages, streaming layout, history navigation and tools                             | chat                        | Model execution, history transport and pagination                         |
| Composer, slash commands, prompt/skill expansion, attachments and queue              | chat                        | Supply commands, uploads and queue execution                              |
| Choice/free-text questions                                                           | question, also used by chat | Real question source and response submission                              |
| Approval requests                                                                    | chat                        | Authorization and applying decisions                                      |
| Workspace picker, tabs, drag/reorder, splitters and maximization intent              | workspace-panel             | Panel lifecycle, preferences and custom surface creation                  |
| Interactive terminal and agent-session output                                        | terminal                    | Typed connector for PTY/RPC and agent interruption                        |
| Browser address, history, remote video/input and viewport                            | browser                     | Typed connector for runtime, video negotiation and transport              |
| Image annotation editor                                                              | image-editor                | Supply source images and optionally handle exported files                 |
| PDF, DOCX, spreadsheet, image and media previews                                     | file-preview                | Load bytes, provide/revoke URLs and downloads                             |
| File tree, path picker, breadcrumbs, document tabs and responsive document workspace | file-explorer               | Read/write/delete, lazy directory loading, autosave and conflict handling |
| Markdown rendering and source/live editor                                            | markdown, markdown-document | Supply content and save edits                                             |
| Change-file diffs                                                                    | code-diff                   | Supply hunks from a diff service                                          |
| Sidebar, conversations, rename/pin/delete and profile menus                          | sidebar                     | Routing, persistence, pagination and sign-out                             |
| Form fields, select, settings rows, save state and locale controls                   | controls                    | Validation/business rules and applying preferences                        |
| Profile, plugin toggles, prompt-template cards/editor and approval settings          | settings                    | Controlled properties/events; no account or plugin API client             |
| Action/conversation search                                                           | search                      | Supply entries, navigate and dismiss the overlay                          |
| Toasts                                                                               | notifications               | Shared convenience store or independent injected stores                   |
| Dictation                                                                            | voice-input                 | Browser permission or injected recognition adapter                        |
| Dialog, loading, icons, theme, locale and keyboard primitives                        | core                        | Application styling and preference policy                                 |

## Composable rather than an application clone

The library intentionally contains no login/session controller, generated Maximus clients,
Hermes wire protocol, account provisioning, plugin backend, billing, channel linking, router,
agent orchestration or database access. Application-specific pages can be assembled from
the supplied components and their controlled data. Their server behavior is not implemented
by a UI package.

The browser adapter owns WebRTC/screencast selection and signalling; the terminal adapter
owns authentication and PTY creation. The file workspace exposes UI and intent instead of
hardcoding Maximus's autosave and deletion services. Explorer expansion and settings changes
are externally persistable; components do not silently write application storage.

Source-specific branding is replaced by slots/callbacks. Public tags use `tacta-`; styling
tokens use `--tacta-*`. Tacta's existing imports remain available through compatibility
re-exports while new consumers can install smaller feature packages.

## Verification

Build/typecheck, package export/dependency checks, runtime-cycle/application-import checks,
Chromium component tests and component-only media captures validate the extraction.
See `test/` for executable behavior and `docs/media/manifest.json` for captured workflows.
The capture fixtures contain local data and adapters; they do not demonstrate a live
Maximus backend or claim production agent execution.
