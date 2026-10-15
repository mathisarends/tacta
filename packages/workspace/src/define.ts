import { registerWorkspacePanelElements } from "@tacta/workspace-panel/define";
import { registerSidebarElements } from "@tacta/sidebar/define";
import { registerCoreElements } from "@tacta/core/define";
export function registerWorkspaceElements(): void {
  registerCoreElements();
  registerWorkspacePanelElements();
  registerSidebarElements();
}
