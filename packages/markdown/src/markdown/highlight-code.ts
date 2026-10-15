import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { classHighlighter, highlightTree } from "@lezer/highlight";

/** Accept only sanitized markup; generated spans contain text, never interpreted code. */
export async function highlightCodeBlocks(markup: string): Promise<string> {
  const template = document.createElement("template");
  template.innerHTML = markup;
  await Promise.all(
    [...template.content.querySelectorAll("pre > code")].map(async (code) => {
      const label = [...code.classList].find((name) => name.startsWith("language-"))?.slice(9);
      const text = code.textContent ?? "";
      if (!label || !text || text.length > 100_000) {
        return;
      }
      const language =
        LanguageDescription.matchLanguageName(languages, label, false) ??
        LanguageDescription.matchFilename(languages, `code.${label}`);
      if (!language) {
        return;
      }
      try {
        const support = await language.load();
        const tree = support.language.parser.parse(text);
        const content = document.createDocumentFragment();
        let position = 0;
        highlightTree(tree, classHighlighter, (from, to, classes) => {
          content.append(text.slice(position, from));
          const span = document.createElement("span");
          span.className = classes;
          span.textContent = text.slice(from, to);
          content.append(span);
          position = to;
        });
        content.append(text.slice(position));
        code.replaceChildren(content);
      } catch {
        // Unknown or unavailable parsers leave their block as readable plain text.
      }
    }),
  );
  return template.innerHTML;
}
