import type { ExplorerResizeDetail } from "./types.js";
import type { SidebarRenameDetail } from "./sidebar/types.js";
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
  navigate: CustomEvent<string>;
  "select-conversation": CustomEvent<string>;
  "toggle-pin": CustomEvent<string>;
  "rename-conversation": CustomEvent<SidebarRenameDetail>;
  "delete-conversation": CustomEvent<string>;
  "load-more": CustomEvent<void>;
  "sign-out": CustomEvent<void>;
  "open-sidebar": CustomEvent<void>;
  "close-sidebar": CustomEvent<void>;
}
