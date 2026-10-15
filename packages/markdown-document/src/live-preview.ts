import { type EditorState, type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { SyntaxNodeRef } from "@lezer/common";

class BulletWidget extends WidgetType {
  override eq(): boolean {
    return true;
  }

  toDOM(): HTMLElement {
    const bullet = document.createElement("span");
    bullet.className = "cm-live-bullet";
    bullet.textContent = "•";
    return bullet;
  }
}

const hiddenMark = Decoration.replace({});
const bulletMark = Decoration.replace({ widget: new BulletWidget() });
const quoteLine = Decoration.line({ class: "cm-live-quote" });
const ruleLine = Decoration.line({ class: "cm-live-rule" });
const listLine = Decoration.line({ class: "cm-live-list" });
const beforeBlockLine = Decoration.line({ class: "cm-live-before-block" });
const afterBlockLine = Decoration.line({ class: "cm-live-after-block" });
const BLOCKS = new Set(["Frontmatter", "FencedCode", "Table"]);
const INLINE_MARKS = new Set(["EmphasisMark", "StrikethroughMark"]);
const LINKS = new Set(["Link", "Image"]);

class BlockLabelWidget extends WidgetType {
  constructor(private readonly label: string) {
    super();
  }

  override eq(other: BlockLabelWidget): boolean {
    return this.label === other.label;
  }

  toDOM(): HTMLElement {
    const label = document.createElement("span");
    label.className = "cm-live-block-label";
    label.textContent = this.label;
    return label;
  }

  override ignoreEvent(): boolean {
    return false;
  }
}

function decorateBlock(
  state: EditorState,
  node: SyntaxNodeRef,
  from: number,
  to: number,
): Range<Decoration>[] {
  const { doc } = state;
  const first = doc.lineAt(node.from);
  const last = doc.lineAt(Math.max(node.from, node.to - 1));
  const closing = node.node.lastChild;
  const closed =
    closing !== null &&
    closing.from > node.from &&
    (closing.name === "DashLine" || closing.name === "CodeMark");
  const ranges: Range<Decoration>[] = [];
  const info = node.node.getChild("CodeInfo");
  const language = info ? doc.sliceString(info.from, info.to) : "";
  const label = language || "Code";

  for (let number = first.number; number <= last.number; number++) {
    const line = doc.line(number);
    if (line.from < from || line.from > to) {
      continue;
    }
    const classes = ["cm-live-block", "cm-live-code"];
    if (number === first.number) {
      classes.push("cm-live-block-start");
    }
    if (number === last.number) {
      classes.push("cm-live-block-end");
    }
    if (closed && number === last.number) {
      classes.push("cm-live-block-footer");
    }
    ranges.push(Decoration.line({ class: classes.join(" ") }).range(line.from));
    if (number === first.number) {
      ranges.push(
        Decoration.replace({ widget: new BlockLabelWidget(label) }).range(node.from, line.to),
      );
    } else if (closed && number === last.number && closing) {
      ranges.push(hiddenMark.range(closing.from, line.to));
    }
  }
  return ranges;
}

function withTrailingSpace(state: EditorState, node: SyntaxNodeRef): Range<Decoration> {
  const end = state.doc.sliceString(node.to, node.to + 1) === " " ? node.to + 1 : node.to;
  return hiddenMark.range(node.from, end);
}

function decorate(state: EditorState, node: SyntaxNodeRef): Range<Decoration>[] {
  const parent = node.node.parent?.name ?? "";
  const line = state.doc.lineAt(node.from);
  switch (node.name) {
    case "ATXHeading1":
    case "ATXHeading2":
    case "ATXHeading3":
    case "ATXHeading4":
    case "ATXHeading5":
    case "ATXHeading6":
      return [Decoration.line({ class: "cm-live-heading" }).range(line.from)];
    case "InlineCode":
      return [Decoration.mark({ class: "cm-live-inline-code" }).range(node.from, node.to)];
    case "HeaderMark":
      return [withTrailingSpace(state, node)];
    case "QuoteMark":
      return [quoteLine.range(line.from), withTrailingSpace(state, node)];
    case "ListMark":
      if (parent !== "ListItem") {
        return [];
      }
      if (node.node.parent?.parent?.name === "BulletList") {
        return [listLine.range(line.from), bulletMark.range(node.from, node.to)];
      }
      return [listLine.range(line.from)];
    case "HorizontalRule":
      return [ruleLine.range(line.from), hiddenMark.range(node.from, node.to)];
    case "CodeMark":
      return parent === "InlineCode" ? [hiddenMark.range(node.from, node.to)] : [];
    case "LinkMark":
    case "URL":
    case "LinkTitle":
      return LINKS.has(parent) ? [hiddenMark.range(node.from, node.to)] : [];
    default:
      return INLINE_MARKS.has(node.name) ? [hiddenMark.range(node.from, node.to)] : [];
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const ranges: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    const { doc } = view.state;
    const blocks: { from: number; to: number }[] = [];
    const codeBlocks: { from: number; to: number }[] = [];
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (BLOCKS.has(node.name)) {
          blocks.push({ from: node.from, to: node.to });
          if (node.name === "FencedCode") {
            codeBlocks.push({ from: node.from, to: node.to });
            ranges.push(...decorateBlock(view.state, node, from, to));
          }
          return false;
        }
        ranges.push(...decorate(view.state, node));
        return undefined;
      },
    });
    const isText = (number: number) => {
      if (number < 1 || number > doc.lines) {
        return false;
      }
      const line = doc.line(number);
      return (
        line.length > 0 && !blocks.some((block) => line.from >= block.from && line.from <= block.to)
      );
    };
    for (const block of codeBlocks) {
      const before = doc.lineAt(block.from).number - 1;
      const after = doc.lineAt(block.to).number + 1;
      if (isText(before)) {
        ranges.push(beforeBlockLine.range(doc.line(before).from));
      }
      if (isText(after)) {
        ranges.push(afterBlockLine.range(doc.line(after).from));
      }
    }
    const first = doc.lineAt(from).number;
    const last = doc.lineAt(to).number;
    for (let number = first; number <= last; number++) {
      const line = doc.line(number);
      if (
        line.length === 0 &&
        !blocks.some((block) => line.from >= block.from && line.from < block.to)
      ) {
        ranges.push(Decoration.line({ class: "cm-live-spacer" }).range(line.from));
      }
    }
  }
  return Decoration.set(ranges, true);
}

export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate): void {
      if (
        update.docChanged ||
        update.viewportChanged ||
        syntaxTree(update.startState) !== syntaxTree(update.state)
      ) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
