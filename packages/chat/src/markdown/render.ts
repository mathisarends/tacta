import { directive, type DirectiveResult } from "lit/directive.js";
import { AsyncDirective } from "lit/async-directive.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import DOMPurify from "dompurify";
import { marked } from "marked";

export function markdownHtml(text: string): string {
  const parsed = marked.parse(text, { async: false, breaks: true, gfm: true });
  return DOMPurify.sanitize(parsed, {
    FORBID_TAGS: ["form", "iframe", "math", "style", "svg"],
    FORBID_ATTR: ["style"],
  });
}

class MarkdownDirective extends AsyncDirective {
  private text: string | undefined;
  private version = 0;
  private content: DirectiveResult = unsafeHTML("");

  render(text: string): DirectiveResult {
    if (this.text === text) {
      return this.content;
    }
    this.text = text;
    const version = ++this.version;
    const parsed = markdownHtml(text);
    this.content = unsafeHTML(parsed);
    // Render immediately, including during streaming; load parsers only for code blocks.
    if (parsed.includes('<code class="language-')) {
      void import("./highlight-code.js")
        .then(({ highlightCodeBlocks }) => highlightCodeBlocks(parsed))
        .then((highlighted) => {
          if (version !== this.version) {
            return;
          }
          this.content = unsafeHTML(highlighted);
          if (this.isConnected) {
            this.setValue(this.content);
          }
        })
        .catch(() => {
          // A failed language download must not hide the original code.
        });
    }
    return this.content;
  }

  protected override reconnected(): void {
    this.setValue(this.content);
  }
}

export const renderMarkdown = directive(MarkdownDirective);
