import type { ExplorerResizeDetail } from "./types.js";
import type { TabMove } from "./workspace-tab-bar.js";
import type { Surface } from "./surfaces.js";

export interface WorkspaceEventMap {
  "panel-resize": CustomEvent<number>;
  "panel-resize-end": CustomEvent<void>;
  "explorer-resize": CustomEvent<ExplorerResizeDetail>;
  "tab-select": CustomEvent<string>;
  "tab-close": CustomEvent<string>;
  "tab-move": CustomEvent<TabMove>;
  "surface-open": CustomEvent<Surface>;
}
