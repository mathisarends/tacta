# Tacta documentation

Tacta is a small core plus independently installable UI extensions. Start with the
[installation guide](installation.md), then choose components from the catalog below.
All examples use the actual library elements. Screenshots are cropped to components;
recordings show component interactions with local test data.

| Package                    | Purpose                                                                     | Guide                                            |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| `@tacta/core`              | Theme tokens, locale, icons, dialogs, tabs, loading and keyboard primitives | [Core](extensions/core.md)                       |
| `@tacta/chat`              | Messages, tools, composer, slash commands, approvals and attachments        | [Chat](extensions/chat.md)                       |
| `@tacta/question`          | Standalone choice and free-text questions                                   | [Questions](extensions/question.md)              |
| `@tacta/workspace-panel`   | Configurable surface picker, tabs, drag/reorder and resizing                | [Workspace panel](extensions/workspace-panel.md) |
| `@tacta/terminal`          | xterm renderer, search, interactive shell and agent output                  | [Terminal](extensions/terminal.md)               |
| `@tacta/browser`           | Remote video viewer, address, history and input                             | [Browser](extensions/browser.md)                 |
| `@tacta/sidebar`           | Conversations, pin/rename menus, navigation and profile                     | [Sidebar](extensions/sidebar.md)                 |
| `@tacta/voice-input`       | Dictation with an injectable speech-recognition boundary                    | [Voice](extensions/voice-input.md)               |
| `@tacta/image-editor`      | Draw, text, erase, color, undo/redo, zoom and PNG export                    | [Image editor](extensions/image-editor.md)       |
| `@tacta/file-preview`      | Lazy PDF, Word, spreadsheet, image, audio and video previews                | [File previews](extensions/file-preview.md)      |
| `@tacta/file-explorer`     | File tree, breadcrumbs, document tabs, toolbar and slotted workspace        | [File explorer](extensions/file-explorer.md)     |
| `@tacta/markdown`          | Sanitized Markdown and lazy code highlighting                               | [Markdown](extensions/markdown.md)               |
| `@tacta/markdown-document` | CodeMirror Markdown/source editor and live preview                          | [Editor](extensions/markdown-document.md)        |
| `@tacta/code-diff`         | Syntax-highlighted diff hunks                                               | [Diff](extensions/code-diff.md)                  |
| `@tacta/controls`          | Form fields, selects, checkboxes, settings rows and sections                | [Controls](extensions/controls.md)               |
| `@tacta/settings`          | Profile, plugin toggles, prompt-template editor and approval preferences    | [Settings](extensions/settings.md)               |
| `@tacta/search`            | Search actions and supplied conversations                                   | [Search](extensions/search.md)                   |
| `@tacta/notifications`     | Toasts with independent stores                                              | [Notifications](extensions/notifications.md)     |
| `@tacta/workspace`         | Compatibility facade for sidebar and workspace-panel                        | [Compatibility](extensions/workspace.md)         |

See [composition and theming](composition.md), [component media](media.md), and the
[Maximus parity report](maximus-parity.md) for source provenance and application boundaries.
