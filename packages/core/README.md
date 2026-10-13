# @tacta/core

Shared UI primitives: native dialog, segmented tabs, loading states, icons, tooltips, keyboard
helpers, translations and semantic tokens.

```ts
import "@tacta/core/register";
import "@tacta/core/tokens.css";
import { setLocale } from "@tacta/core";
setLocale("en");
```

Tokens are scoped `--tacta-*` properties. Localization has no application storage or routing dependency.
See [Tacta](https://github.com/mathisarends/tacta#readme) for usage.
