import { EditorState, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { isMap, isScalar, isSeq, parseDocument } from "yaml";
import { markdownDocumentText as text } from "./messages/index.js";

interface MetadataRow {
  path: string[];
  values: string[];
  list: boolean;
}

interface Metadata {
  source: string;
  end: number;
  rows: MetadataRow[];
}

function scalar(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return JSON.stringify(value);
}

function collectRows(node: unknown, path: string[], rows: MetadataRow[]): void {
  if (path.length > 12) {
    throw new Error("Metadata nesting is too deep for the preview");
  }
  if (isMap(node) && node.items.length > 0) {
    for (const pair of node.items) {
      if (!isScalar(pair.key)) {
        throw new Error("Complex metadata keys require the source view");
      }
      collectRows(pair.value, [...path, scalar(pair.key.value)], rows);
    }
    return;
  }
  if (isSeq(node)) {
    if (node.items.every((item) => item === null || isScalar(item))) {
      rows.push({
        path,
        values: node.items.map((item) => scalar(isScalar(item) ? item.value : null)),
        list: true,
      });
    } else {
      node.items.forEach((item, index) => collectRows(item, [...path, String(index + 1)], rows));
    }
    return;
  }
  if (node === null || isScalar(node) || isMap(node)) {
    rows.push({ path, values: [scalar(isScalar(node) ? node.value : null)], list: false });
    return;
  }
  // Leave aliases and unsupported YAML constructs visible in their original form.
  throw new Error("Unsupported metadata value");
}

function readMetadata(state: EditorState): Metadata | null {
  const match = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?=\n|$)/.exec(state.doc.toString());
  if (!match) {
    return null;
  }
  try {
    const document = parseDocument(match[1] ?? "");
    if (document.errors.length || document.warnings.length || !isMap(document.contents)) {
      return null;
    }
    const rows: MetadataRow[] = [];
    collectRows(document.contents, [], rows);
    if (rows.length === 0 || rows.some((row) => row.path.length === 0)) {
      return null;
    }
    return { source: match[0], end: match[0].length, rows };
  } catch {
    return null;
  }
}

function renderFields(rows: MetadataRow[], depth = 0): HTMLElement {
  const fields = document.createElement("dl");
  const groups = new Map<string, MetadataRow[]>();
  for (const row of rows) {
    const key = row.path[depth];
    if (key === undefined) {
      continue;
    }
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  for (const [key, group] of groups) {
    const term = document.createElement("dt");
    term.textContent = key;
    const description = document.createElement("dd");
    const row = group[0];
    if (!row) {
      continue;
    }
    if (row.path.length > depth + 1) {
      term.className = "cm-metadata-group-title";
      description.className = "cm-metadata-group";
      description.append(renderFields(group, depth + 1));
    } else if (row.list && row.values.length > 0) {
      description.className = "cm-metadata-list";
      for (const value of row.values) {
        const item = document.createElement("span");
        item.className = "cm-metadata-tag";
        item.textContent = value;
        description.append(item);
      }
    } else {
      description.textContent = row.values.join(", ") || "—";
    }
    fields.append(term, description);
  }
  return fields;
}

class MetadataWidget extends WidgetType {
  constructor(
    private readonly metadata: Metadata,
    private readonly editSource?: (position: number) => void,
  ) {
    super();
  }

  override eq(other: MetadataWidget): boolean {
    return this.metadata.source === other.metadata.source && this.editSource === other.editSource;
  }

  toDOM(view: EditorView): HTMLElement {
    const section = document.createElement("section");
    section.className = "cm-metadata";
    section.setAttribute("aria-label", text.metadata);
    const header = document.createElement("div");
    header.className = "cm-metadata-header";
    const title = document.createElement("span");
    title.textContent = text.metadata;
    header.append(title);
    if (this.editSource) {
      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = text.edit;
      edit.addEventListener("click", () => {
        this.editSource?.(view.state.doc.line(2).from);
      });
      header.append(edit);
    }
    section.append(header);
    section.append(renderFields(this.metadata.rows));
    return section;
  }
}

export function metadataPreview(editSource?: (position: number) => void) {
  function decorations(state: EditorState): DecorationSet {
    const metadata = readMetadata(state);
    if (!metadata) {
      return Decoration.none;
    }
    return Decoration.set([
      Decoration.replace({ widget: new MetadataWidget(metadata, editSource), block: true }).range(
        0,
        metadata.end,
      ),
    ]);
  }
  return [
    StateField.define<DecorationSet>({
      create: decorations,
      update: (value, transaction) =>
        transaction.docChanged ? decorations(transaction.state) : value,
      provide: (field) => EditorView.decorations.from(field),
    }),
    metadataTheme,
  ];
}

const metadataTheme = EditorView.baseTheme({
  ".cm-metadata": {
    fontFamily: "var(--tacta-font-family, system-ui, sans-serif)",
    fontSize: "13px",
    lineHeight: "1.5",
    whiteSpace: "normal",
    padding: "0 0 14px",
    marginBottom: "8px",
    borderBottom: "1px solid var(--tacta-color-border-strong, #ffffff1f)",
  },
  ".cm-metadata-header": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
    color: "var(--tacta-color-muted, #a3a3a5)",
    fontSize: "12px",
  },
  ".cm-metadata button": {
    background: "transparent",
    border: "none",
    borderRadius: "4px",
    color: "var(--tacta-color-muted, #a3a3a5)",
    font: "inherit",
    padding: "3px 6px",
    cursor: "pointer",
  },
  ".cm-metadata button:hover": {
    background: "var(--tacta-color-surface, #252627)",
    color: "var(--tacta-color-text, #e6e6e6)",
  },
  ".cm-metadata button:focus-visible": { outline: "1px solid var(--tacta-color-focus, #9b9b9e)" },
  ".cm-metadata dl": {
    display: "grid",
    gridTemplateColumns: "minmax(90px, 150px) minmax(0, 1fr)",
    margin: "0",
    gap: "7px 18px",
  },
  ".cm-metadata dt": { color: "var(--tacta-color-muted, #a3a3a5)", overflowWrap: "anywhere" },
  ".cm-metadata-group-title": { gridColumn: "1 / -1", fontWeight: "600", paddingTop: "4px" },
  ".cm-metadata dd.cm-metadata-group": {
    gridColumn: "1 / -1",
    marginLeft: "3px",
    paddingLeft: "14px",
    borderLeft: "1px solid var(--tacta-color-border-strong, #ffffff1f)",
  },
  ".cm-metadata dd": {
    margin: "0",
    minWidth: "0",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  ".cm-metadata-list": { display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" },
  ".cm-metadata-tag": {
    background: "var(--tacta-color-surface, #252627)",
    borderRadius: "4px",
    padding: "1px 7px",
    fontSize: "12px",
  },
  "@media (max-width: 600px)": {
    ".cm-metadata dl": {
      gridTemplateColumns: "minmax(70px, 100px) minmax(0, 1fr)",
      columnGap: "12px",
    },
  },
});
