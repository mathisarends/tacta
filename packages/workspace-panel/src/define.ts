import { TactaSplitPane } from "./split-pane.js";
import { SurfaceMenu } from "./surface-menu.js";
import { SurfacePicker } from "./surface-picker.js";
import { WorkspaceTabBar } from "./workspace-tab-bar.js";
import { WorkspaceTab } from "./workspace-tab.js";
import { TactaPanelSplitter } from "./panel-splitter.js";
import { TactaExplorerSplitter } from "./explorer-splitter.js";
export function registerWorkspacePanelElements(): void {
  if (!customElements.get("tacta-split-pane")) {
    customElements.define("tacta-split-pane", TactaSplitPane);
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
    "tacta-surface-menu": SurfaceMenu;
    "tacta-surface-picker": SurfacePicker;
    "tacta-workspace-tab-bar": WorkspaceTabBar;
    "tacta-workspace-tab": WorkspaceTab;
    "tacta-panel-splitter": TactaPanelSplitter;
    "tacta-explorer-splitter": TactaExplorerSplitter;
  }
}
