import { DocumentWorkspace } from "./components/document-workspace.js";
import { registerWorkspacePanelElements } from "@tacta/workspace-panel/define";
import { registerCoreElements } from "@tacta/core/define";
import { DocumentExplorer } from "./components/document-explorer.js";
import { DocumentExplorerSkeleton } from "./components/document-explorer-skeleton.js";
import { DocumentTabs } from "./components/document-tabs.js";
import { DocumentTab } from "./components/document-tab.js";
import { DocumentSkeleton } from "./components/document-skeleton.js";
import { ExplorerFileRow } from "./components/explorer-file-row.js";
import { ExplorerFolderRow } from "./components/explorer-folder-row.js";
import { WorkspaceBreadcrumb } from "./components/workspace-breadcrumb.js";
import { PathPicker } from "./components/path-picker.js";
import { FileDocumentToolbar } from "./components/file-document-toolbar.js";
export function registerFileExplorerElements(): void {
  registerCoreElements();
  registerWorkspacePanelElements();
  if (!customElements.get("tacta-document-workspace")) {
    customElements.define("tacta-document-workspace", DocumentWorkspace);
  }
  if (!customElements.get("tacta-document-explorer")) {
    customElements.define("tacta-document-explorer", DocumentExplorer);
  }
  if (!customElements.get("tacta-document-explorer-skeleton")) {
    customElements.define("tacta-document-explorer-skeleton", DocumentExplorerSkeleton);
  }
  if (!customElements.get("tacta-document-tabs")) {
    customElements.define("tacta-document-tabs", DocumentTabs);
  }
  if (!customElements.get("tacta-document-tab")) {
    customElements.define("tacta-document-tab", DocumentTab);
  }
  if (!customElements.get("tacta-document-skeleton")) {
    customElements.define("tacta-document-skeleton", DocumentSkeleton);
  }
  if (!customElements.get("tacta-explorer-file-row")) {
    customElements.define("tacta-explorer-file-row", ExplorerFileRow);
  }
  if (!customElements.get("tacta-explorer-folder-row")) {
    customElements.define("tacta-explorer-folder-row", ExplorerFolderRow);
  }
  if (!customElements.get("tacta-workspace-breadcrumb")) {
    customElements.define("tacta-workspace-breadcrumb", WorkspaceBreadcrumb);
  }
  if (!customElements.get("tacta-path-picker")) {
    customElements.define("tacta-path-picker", PathPicker);
  }
  if (!customElements.get("tacta-file-document-toolbar")) {
    customElements.define("tacta-file-document-toolbar", FileDocumentToolbar);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-document-workspace": DocumentWorkspace;
    "tacta-document-explorer": DocumentExplorer;
    "tacta-document-explorer-skeleton": DocumentExplorerSkeleton;
    "tacta-document-tabs": DocumentTabs;
    "tacta-document-tab": DocumentTab;
    "tacta-document-skeleton": DocumentSkeleton;
    "tacta-explorer-file-row": ExplorerFileRow;
    "tacta-explorer-folder-row": ExplorerFolderRow;
    "tacta-workspace-breadcrumb": WorkspaceBreadcrumb;
    "tacta-path-picker": PathPicker;
    "tacta-file-document-toolbar": FileDocumentToolbar;
  }
}
