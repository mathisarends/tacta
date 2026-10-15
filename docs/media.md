# Component screenshots and recordings

These are direct captures of the actual library components, tightly cropped to their bounds.
No showcase page, navigation shell or marketing layout is included. Data and remote sessions
come from local test fixtures; recordings do not run a real agent or shell.

| Component     | Screenshot                                                           | Recording                                                       |
| ------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| Question      | [Dark](media/question.png), [light](media/question-light.png)        | [Choice and free text](media/question-workflow.mp4)             |
| Chat history  | [Messages and tool activity](media/chat.png)                         | —                                                               |
| Composer      | [Composer](media/composer.png), [slash commands](media/commands.png) | —                                                               |
| Approval      | [Approval card](media/approval.png)                                  | —                                                               |
| Workspace     | [Tab bar](media/workspace.png)                                       | —                                                               |
| Terminal      | [Output](media/terminal.png), [search](media/terminal-search.png)    | [Typing and search](media/terminal-workflow.mp4)                |
| Browser       | [Browser toolbar](media/browser.png)                                 | [Address and history](media/browser-workflow.mp4)               |
| Image editor  | [Annotations](media/image-editor.png)                                | [Draw, text, undo/redo and export](media/image-annotations.mp4) |
| File preview  | [CSV preview](media/files.png)                                       | —                                                               |
| Markdown      | [Live editor](media/editor.png)                                      | —                                                               |
| Diff          | [Code changes](media/diff.png)                                       | —                                                               |
| File explorer | [Tree and filter](media/explorer.png)                                | —                                                               |
| Settings      | [Rows and controls](media/settings.png)                              | —                                                               |
| Search        | [Action and conversation search](media/search.png)                   | —                                                               |
| Sidebar       | [Conversation navigation](media/sidebar.png)                         | —                                                               |
| Notifications | [Toast](media/notifications.png)                                     | —                                                               |

## Reproduce

Build packages, install Playwright Chromium once, and run:

```sh
npm run build
npm exec playwright install chromium
npm run docs:media
```

FFmpeg must be on PATH for MP4 and GIF output. Set `PLAYWRIGHT_BROWSERS_PATH` if your
browser cache lives outside Playwright's default location. The capture script starts a
temporary local Vite server, drives component fixtures, crops screenshots with Playwright
locators and crops recordings to the same component bounds using FFmpeg. It shuts down
the browser and server when finished. `docs/media/manifest.json` records produced assets
and exercised interactions.
