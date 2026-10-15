# Markdown rendering

`@tacta/markdown` exports `renderMarkdown`, `markdownHtml` and `markdownStyles` without
registering elements. Install it with core. Chat and the document editor consume it;
core, questions, workspace tabs and terminal do not.

```ts
import { html } from "lit";
import { renderMarkdown, markdownStyles } from "@tacta/markdown";
// Use markdownStyles in a Lit element's styles and renderMarkdown(text) in render().
```

Markdown is parsed with marked and sanitized with DOMPurify before insertion. Code
highlighting loads language support lazily. This renderer does not execute HTML scripts
or contact an application API. Font/reading/code roles inherit through Tacta tokens.
See the [chat screenshot](../media/chat.png) for rendered Markdown and tool context.
