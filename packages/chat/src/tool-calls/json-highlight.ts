import { html, type TemplateResult } from "lit";

function tokenKind(token: string, next: string | undefined): string {
  if (token.startsWith('"')) {
    return next === ":" ? "key" : "string";
  }
  if (token === "null") {
    return "null";
  }
  if (/^(true|false)$/.test(token)) {
    return "boolean";
  }
  return "number";
}

// Validate first so partial previews and ordinary text retain their original appearance.
export function highlightJson(source: string): string | (string | TemplateResult)[] {
  try {
    JSON.parse(source);
  } catch {
    return source;
  }
  const tokens =
    /"(?:[^"\\]|\\.)*"\s*(?=:)|"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b/g;
  const parts: (string | TemplateResult)[] = [];
  let offset = 0;
  for (const match of source.matchAll(tokens)) {
    parts.push(source.slice(offset, match.index));
    const token = match[0];
    const kind = tokenKind(token, source[match.index + token.length]);
    // Lit escapes token text, including any HTML embedded in tool results.
    parts.push(html`<span class=${`json-${kind}`}>${token}</span>`);
    offset = match.index + token.length;
  }
  parts.push(source.slice(offset));
  return parts;
}
