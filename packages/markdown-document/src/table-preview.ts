import { type EditorState, type Range, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { markdownHtml } from "@tacta/markdown";

class TableWidget extends WidgetType {
  constructor(private readonly source: string) {
    super();
  }

  override eq(other: TableWidget): boolean {
    return this.source === other.source;
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-live-table";
    const scroller = document.createElement("div");
    scroller.className = "cm-live-table-scroller";
    scroller.innerHTML = markdownHtml(this.source);
    wrapper.append(scroller);
    return wrapper;
  }
}

function decorations(state: EditorState): DecorationSet {
  const ranges: Range<Decoration>[] = [];
  syntaxTree(state).iterate({
    enter: (node) => {
      if (node.name !== "Table") {
        return undefined;
      }
      if (node.node.parent?.name === "Document") {
        const from = state.doc.lineAt(node.from).from;
        const to = state.doc.lineAt(node.to).to;
        const widget = new TableWidget(state.doc.sliceString(from, to));
        ranges.push(Decoration.replace({ widget, block: true }).range(from, to));
      }
      return false;
    },
  });
  return Decoration.set(ranges);
}

const tableTheme = EditorView.baseTheme({
  ".cm-live-table": {
    padding: "6px 0 10px",
    fontFamily: "var(--tacta-font-family, system-ui, sans-serif)",
    whiteSpace: "normal",
  },
  ".cm-live-table-scroller": { overflowX: "auto" },
  ".cm-live-table table": {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    border: "1px solid var(--tacta-color-border, #ffffff0d)",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  ".cm-live-table th, .cm-live-table td": {
    padding: "7px 12px",
    textAlign: "left",
    verticalAlign: "top",
    borderBottom: "1px solid var(--tacta-color-border, #ffffff0d)",
  },
  ".cm-live-table th + th, .cm-live-table td + td": {
    borderLeft: "1px solid var(--tacta-color-border, #ffffff0d)",
  },
  ".cm-live-table tbody tr:last-child td": { borderBottom: "none" },
  ".cm-live-table th": {
    backgroundColor: "var(--tacta-color-surface, #252627)",
    color: "var(--tacta-color-muted, #a3a3a5)",
    fontSize: "12px",
    fontWeight: "600",
  },
  ".cm-live-table th:first-child": { borderTopLeftRadius: "8px" },
  ".cm-live-table th:last-child": { borderTopRightRadius: "8px" },
  ".cm-live-table code": {
    backgroundColor: "var(--tacta-color-surface, #252627)",
    borderRadius: "3px",
    padding: "1px 4px",
    fontFamily: "var(--tacta-font-mono, ui-monospace, monospace)",
    fontSize: "0.92em",
    whiteSpace: "nowrap",
  },
  ".cm-live-table a": { color: "var(--tacta-color-accent, #ffffff)", textDecoration: "underline" },
});

export const tablePreview = [
  StateField.define<DecorationSet>({
    create: decorations,
    update: (value, transaction) => {
      if (
        transaction.docChanged ||
        syntaxTree(transaction.startState) !== syntaxTree(transaction.state)
      ) {
        return decorations(transaction.state);
      }
      return value;
    },
    provide: (field) => EditorView.decorations.from(field),
  }),
  tableTheme,
];
