# Core

`@tacta/core` has one runtime dependency: Lit. It contains no feature registration,
transport, Markdown parser, editor, terminal or document parser.

```ts
import "@tacta/core/tokens.css";
import "@tacta/core/register";
import { setLocale } from "@tacta/core/i18n";
setLocale("en");
```

Tags: `tacta-modal`, `tacta-segmented-tabs`, `tacta-spinner`, `tacta-skeleton`.
Utilities include `icon`, tooltip, menu positioning, roving keyboard navigation and
shortcut descriptions. `TactaElement` subscribes to locale changes for custom components.
Focused utilities are exported through subpaths such as `@tacta/core/icons` and
`@tacta/core/keyboard/shortcuts`.

```html
<tacta-modal heading="Confirm changes">
  <p>Your application supplies the content and actions.</p>
</tacta-modal>
```

Set `open=true` to show the modal and listen for `modal-close`. `dismissible=false`
prevents dismissing via Escape/backdrop. The host owns decisions and data persistence.
See [composition](../composition.md) for theme tokens, parts, slots and locale ownership.
