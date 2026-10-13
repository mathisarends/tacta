# @tacta/chat

Chat messages, streaming history/navigation, tool-call UI, attachments, composer, model/provider
picker, reasoning/access controls, approvals, questions, queue and voice input.

```ts
import "@tacta/chat/register";
import type { Message, ComposerMessage, ToolCall } from "@tacta/chat";
```

Properties carry data; composed DOM events carry intent. Transport and agent execution stay in your
application. Use `presentCall`, `providerInfo` and `renderProviderIcon` to supply custom presentation.

See [Tacta](https://github.com/mathisarends/tacta#readme) for installation and theming.
