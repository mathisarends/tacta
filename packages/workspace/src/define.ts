import { ConversationRow } from "./sidebar/conversation-row.js";
import { ProfileMenu } from "./sidebar/profile-menu.js";
import { RenameDialog } from "./sidebar/rename-dialog.js";
import { SideBar } from "./sidebar/side-bar.js";
import { UserProfile } from "./sidebar/user-profile.js";
import { SurfaceMenu } from "./surface-menu.js";
import { SurfacePicker } from "./surface-picker.js";
import { WorkspaceTabBar } from "./workspace-tab-bar.js";
import { WorkspaceTab } from "./workspace-tab.js";
import { TactaPanelSplitter } from "./panel-splitter.js";
import { TactaExplorerSplitter } from "./explorer-splitter.js";
import { TactaSplitPane } from "./split-pane.js";
import { registerCoreElements } from "@tacta/core/define";

export function registerWorkspaceElements(): void {
  if (!customElements.get("tacta-split-pane")) {
    customElements.define("tacta-split-pane", TactaSplitPane);
  }
  registerCoreElements();
  if (!customElements.get("tacta-conversation-row")) {
    customElements.define("tacta-conversation-row", ConversationRow);
  }
  if (!customElements.get("tacta-profile-menu")) {
    customElements.define("tacta-profile-menu", ProfileMenu);
  }
  if (!customElements.get("tacta-rename-dialog")) {
    customElements.define("tacta-rename-dialog", RenameDialog);
  }
  if (!customElements.get("tacta-side-bar")) {
    customElements.define("tacta-side-bar", SideBar);
  }
  if (!customElements.get("tacta-user-profile")) {
    customElements.define("tacta-user-profile", UserProfile);
  }
  if (!customElements.get("tacta-surface-menu")) {
    customElements.define("tacta-surface-menu", SurfaceMenu);
  }
  if (!customElements.get("tacta-surface-picker")) {
    customElements.define("tacta-surface-picker", SurfacePicker);
  }
  if (!customElements.get("tacta-workspace-tab-bar")) {
    customElements.define("tacta-workspace-tab-bar", WorkspaceTabBar);
  }
  if (!customElements.get("tacta-workspace-tab")) {
    customElements.define("tacta-workspace-tab", WorkspaceTab);
  }
  if (!customElements.get("tacta-panel-splitter")) {
    customElements.define("tacta-panel-splitter", TactaPanelSplitter);
  }
  if (!customElements.get("tacta-explorer-splitter")) {
    customElements.define("tacta-explorer-splitter", TactaExplorerSplitter);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tacta-split-pane": TactaSplitPane;
    "tacta-conversation-row": ConversationRow;
    "tacta-profile-menu": ProfileMenu;
    "tacta-rename-dialog": RenameDialog;
    "tacta-side-bar": SideBar;
    "tacta-user-profile": UserProfile;
    "tacta-surface-menu": SurfaceMenu;
    "tacta-surface-picker": SurfacePicker;
    "tacta-workspace-tab-bar": WorkspaceTabBar;
    "tacta-workspace-tab": WorkspaceTab;
    "tacta-panel-splitter": TactaPanelSplitter;
    "tacta-explorer-splitter": TactaExplorerSplitter;
  }
}
