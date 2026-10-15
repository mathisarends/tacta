import type { WorkspaceEventMap as PanelEventMap } from "@tacta/workspace-panel/events";
import type { SidebarEventMap } from "@tacta/sidebar/events";
export interface WorkspaceEventMap extends PanelEventMap, SidebarEventMap {}
