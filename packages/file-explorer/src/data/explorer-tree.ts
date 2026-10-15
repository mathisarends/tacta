import type { WorkspaceEntry } from "./workspace-types.js";

export interface Folder {
  folders: Map<string, Folder>;
  files: WorkspaceEntry[];
  entry?: WorkspaceEntry;
}

export interface FolderState {
  collapsed: ReadonlySet<string>;
  revealed: ReadonlySet<string>;
}

export function buildTree(entries: WorkspaceEntry[], search: string): Folder {
  const root: Folder = { folders: new Map(), files: [] };
  const query = search.trim().toLocaleLowerCase();
  for (const entry of entries) {
    if (!`${entry.path} ${entry.label ?? ""}`.toLocaleLowerCase().includes(query)) {
      continue;
    }
    let parent = root;
    const parts = entry.path.split("/");
    const folders = entry.directory ? parts : parts.slice(0, -1);
    for (const part of folders) {
      if (!parent.folders.has(part)) {
        parent.folders.set(part, { folders: new Map(), files: [] });
      }
      parent = parent.folders.get(part)!;
    }
    if (entry.directory) {
      parent.entry = entry;
    } else {
      parent.files.push(entry);
    }
  }
  return root;
}

export function childPath(parent: string, name: string): string {
  if (!parent) {
    return name;
  }
  return `${parent}/${name}`;
}

export function ancestorPaths(path: string): string[] {
  const parts = path.split("/");
  return parts.slice(1).map((_, index) => parts.slice(0, index + 1).join("/"));
}

// Top-level folders without a directory entry start open; loaded directories only once revealed.
export function isOpen(path: string, folder: Folder, depth: number, state: FolderState): boolean {
  if (state.collapsed.has(path)) {
    return false;
  }
  return (!folder.entry && depth <= 1) || state.revealed.has(path);
}

export function openDirectoryIds(
  folder: Folder,
  state: FolderState,
  parent = "",
  depth = 0,
): Set<string> {
  const ids = new Set<string>();
  for (const [name, child] of folder.folders) {
    const path = childPath(parent, name);
    if (!isOpen(path, child, depth, state)) {
      continue;
    }
    if (child.entry) {
      ids.add(child.entry.id);
    }
    for (const id of openDirectoryIds(child, state, path, depth + 1)) {
      ids.add(id);
    }
  }
  return ids;
}
