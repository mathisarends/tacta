export { clampPanelWidth, TactaPanelSplitter } from "./panel-splitter.js";
export { TactaExplorerSplitter } from "./explorer-splitter.js";
export { TactaSplitPane } from "./split-pane.js";
export type {
  ExplorerResizeDetail,
  ExplorerResizeEvent,
  PanelResizeEvent,
  PanelResizeEndEvent,
} from "./types.js";

export { panelText } from "./messages/index.js";
export { SurfaceMenu } from "./surface-menu.js";
export { SurfacePicker } from "./surface-picker.js";
export type { Surface } from "./surfaces.js";
export { WorkspaceTab, type WorkspaceTabData } from "./workspace-tab.js";
export { WorkspaceTabBar, type TabMove } from "./workspace-tab-bar.js";
export { workspaceTabStyles, workspaceTabBarStyles } from "./workspace-tabs.styles.js";
export { SideBar } from "./sidebar/side-bar.js";
export { ConversationRow } from "./sidebar/conversation-row.js";
export { UserProfile } from "./sidebar/user-profile.js";
export { ProfileMenu } from "./sidebar/profile-menu.js";
export { RenameDialog } from "./sidebar/rename-dialog.js";
export type { SidebarItem, SidebarRenameDetail } from "./sidebar/types.js";
export type { NavigationEntry } from "./navigation-types.js";
export type { WorkspaceEventMap } from "./events.js";
