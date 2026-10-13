# @tacta/workspace

Sidebar, conversation rows, profile menu/avatar, rename dialog, workspace tabs and surface picker,
plus panel/explorer resize handles and a slotted split pane.

```ts
import "@tacta/workspace/register";
```

Applications provide navigation entries, tab data and conversation rows and handle emitted intents.
The sidebar exposes a `brand` slot. Split panes expose default and `panel` slots. Resize handles
support arrows, Home/End, cancellation and `::part(handle)`.

See [Tacta](https://github.com/mathisarends/tacta#readme) for contracts and examples.
