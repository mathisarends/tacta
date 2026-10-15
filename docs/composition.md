# Composition and theming

Every component accepts application data and emits intent through DOM events. The host
owns routing, authentication, persistence, agents, files and remote transports.

```ts
import "@tacta/core/tokens.css";
import "@tacta/chat/register";
import "@tacta/workspace-panel/register";
import "@tacta/terminal/register";
```

```html
<tacta-split-pane value="480" reserve="320" min-width="240">
  <section>
    <tacta-chat-message-list></tacta-chat-message-list>
    <tacta-chat-composer></tacta-chat-composer>
  </section>
  <section slot="panel">
    <tacta-workspace-tab-bar></tacta-workspace-tab-bar>
    <tacta-remote-terminal></tacta-remote-terminal>
  </section>
</tacta-split-pane>
```

Assign object data as JavaScript properties, rather than JSON attributes. In Lit, use
property bindings such as `.messages=${messages}` and events such as `@send-message`.
Other frameworks use element refs and the same properties/events. Give terminal,
browser and document components a real height and their flex parents `min-height: 0`.

Keep a session component mounted when switching tabs. Hide inactive panels and set their
`active` property to `false`. Remove a component when its tab closes: its controller
aborts pending connections and closes its session. A host may implement session reuse
inside its adapter; Tacta does not create a global session pool.

## Application-defined surfaces

```ts
const tabs = document.querySelector("tacta-workspace-tab-bar")!;
tabs.surfaces = [
  { id: "Terminal", label: "Shell", icon: "terminal", key: "t" },
  { id: "graph", label: "Knowledge graph", icon: "chart", key: "g" },
];
tabs.tabs = [
  { id: "graph-1", label: "Project graph", surface: "graph", icon: "chart", url: "", favicon: "" },
];
tabs.addEventListener("surface-open", (event) => {
  const surface = (event as CustomEvent<string>).detail;
  // Create your own panel for this surface ID.
});
```

The picker renders only configured surfaces and honors only their configured shortcut
keys. Built-in Browser, Terminal and Files definitions remain the defaults.

## Themes and localization

```css
.workspace {
  --tacta-font-family: system-ui, sans-serif;
  --tacta-color-accent: #86c8b2;
  --tacta-color-focus: #86c8b2;
  --tacta-radius-panel: 12px;
}
```

Optional `data-tacta-theme="light"` and `"dark"` regions supply defaults. CSS tokens
inherit into shadow roots; public `part` names permit focused overrides. The terminal
renders through xterm: call `refreshTheme()` after changing its inherited CSS colors,
or supply an xterm theme through `options.theme`.

```ts
import { setLocale } from "@tacta/core/i18n";
setLocale("de");
```

Locale changes update connected elements. Tacta does not read browser preferences,
write storage or reload the page. The locale-switch control emits `locale-change`;
the host decides how to apply and persist it.

Model/provider icons and tool-call titles accept application callbacks. Sidebar branding
and document content use slots. Form controls retain native inputs, validation and
autofill; some intentionally render in light DOM. Prefer the package's focused exports
when composing smaller pieces instead of importing an unrelated feature package.
