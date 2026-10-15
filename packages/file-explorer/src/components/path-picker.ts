import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { treeStyles } from "@tacta/file-explorer/tree.styles";
import { icon } from "@tacta/core/icons";
import { ancestorPaths, childPath } from "../data/explorer-tree.js";
import { fileIcon } from "./file-icon.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";

interface PickerFolder {
  folders: Map<string, PickerFolder>;
  files: WorkspaceEntry[];
}

function folderTree(entries: WorkspaceEntry[], root: string): PickerFolder {
  const tree: PickerFolder = { folders: new Map(), files: [] };
  const prefix = root ? `${root}/` : "";
  for (const entry of entries) {
    if (!entry.path.startsWith(prefix)) {
      continue;
    }
    let parent = tree;
    const parts = entry.path.slice(prefix.length).split("/");
    const folders = entry.directory ? parts : parts.slice(0, -1);
    for (const part of folders) {
      if (!parent.folders.has(part)) {
        parent.folders.set(part, { folders: new Map(), files: [] });
      }
      parent = parent.folders.get(part)!;
    }
    if (!entry.directory) {
      parent.files.push(entry);
    }
  }
  return tree;
}

function chevronClass(expanded: boolean): string {
  if (expanded) {
    return "chevron expanded";
  }
  return "chevron";
}

export class PathPicker extends LitElement {
  @property({ attribute: false }) entries: WorkspaceEntry[] = [];
  @property() root = "";
  @property() current = "";
  @state() private expanded = new Set<string>();

  constructor() {
    super();
    this.addEventListener("keydown", (event) => this.onKey(event));
  }

  expandCurrent(): void {
    this.expanded = new Set(ancestorPaths(this.current));
  }

  focusItem(path: string): void {
    const item = [...this.renderRoot.querySelectorAll<HTMLElement>(".choice")].find(
      (item) => item.dataset.path === path,
    );
    item?.focus({ preventScroll: true });
    item?.scrollIntoView({ block: "nearest" });
  }

  private emit(name: string, detail: string): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private toggleFolder(path: string): void {
    const expanded = new Set(this.expanded);
    if (expanded.has(path)) {
      expanded.delete(path);
    } else {
      expanded.add(path);
      const entry = this.entries.find((entry) => entry.directory && entry.path === path);
      if (entry) {
        this.dispatchEvent(
          new CustomEvent("directory-open", { detail: entry.id, bubbles: true, composed: true }),
        );
      }
    }
    this.expanded = expanded;
  }

  private onKey(event: KeyboardEvent): void {
    const items = [...this.renderRoot.querySelectorAll<HTMLButtonElement>("button")];
    const index = items.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
    const current = items[index];
    let next: number;
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("picker-dismiss", { bubbles: true, composed: true }));
        return;
      case "ArrowDown":
        next = (index + 1) % items.length;
        break;
      case "ArrowUp":
        next = (index - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      case "ArrowRight":
        event.preventDefault();
        if (current?.getAttribute("aria-expanded") === "false") {
          this.toggleFolder(current.dataset.path!);
        } else if (current?.getAttribute("aria-expanded") === "true") {
          items[index + 1]?.focus();
        }
        return;
      case "ArrowLeft":
        event.preventDefault();
        if (current?.getAttribute("aria-expanded") === "true") {
          this.toggleFolder(current.dataset.path!);
        } else if (current?.dataset.parent) {
          this.focusItem(current.dataset.parent);
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    items[next]?.focus();
  }

  static override styles = [
    workspaceStyles,
    treeStyles,
    css`
      :host {
        display: block;
      }
      button {
        font: inherit;
        cursor: pointer;
        color: inherit;
        border: 0;
        background: transparent;
      }
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }
    `,
  ];

  private renderChildren(
    folder: PickerFolder,
    path: string,
    depth: number,
  ): TemplateResult | typeof nothing {
    if (!this.expanded.has(path)) {
      return nothing;
    }
    return this.renderFolder(folder, path, depth + 1);
  }

  private renderFolderItem(
    name: string,
    folder: PickerFolder,
    parent: string,
    depth: number,
  ): TemplateResult {
    const path = childPath(parent, name);
    const expanded = this.expanded.has(path);
    return html`<li>
      <button
        class="choice tree-row folder"
        aria-expanded=${expanded}
        data-path=${path}
        data-parent=${parent}
        style=${`--tacta-depth:${depth}`}
        @click=${() => this.toggleFolder(path)}
      >
        <span class=${chevronClass(expanded)}>${icon("chevronDown", 12)}</span>
        ${icon("folder", 14)}<span class="name">${name}</span>
      </button>
      ${this.renderChildren(folder, path, depth)}
    </li>`;
  }

  private renderFileItem(entry: WorkspaceEntry, parent: string, depth: number): TemplateResult {
    return html`<li>
      <button
        class="choice tree-row"
        data-path=${entry.path}
        data-parent=${parent}
        style=${`--tacta-depth:${depth}`}
        aria-current=${entry.path === this.current ? "page" : nothing}
        @click=${() => this.emit("file-pick", entry.id)}
      >
        <span class="file-icon">${fileIcon(entry.path, 16, entry.icon)}</span
        ><span class="name">${entry.path.split("/").at(-1)}</span>
      </button>
    </li>`;
  }

  private renderFolder(folder: PickerFolder, parent: string, depth = 0): TemplateResult {
    const folders = [...folder.folders].sort(([a], [b]) => a.localeCompare(b));
    return html`<ul>
      ${folders.map(([name, child]) => this.renderFolderItem(name, child, parent, depth))}
      ${folder.files.map((entry) => this.renderFileItem(entry, parent, depth))}
    </ul>`;
  }

  override render(): TemplateResult {
    return this.renderFolder(folderTree(this.entries, this.root), this.root);
  }
}
