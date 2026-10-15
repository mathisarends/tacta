import type { IconName } from "@tacta/core/icons";

export interface WorkspaceEntry {
  id: string;
  path: string;
  label?: string;
  icon?: IconName;
  dirty?: boolean;
  preview?: boolean;
  directory?: boolean;
  loading?: boolean;
  deletable?: boolean;
}

export interface WorkspaceDocumentEntry extends WorkspaceEntry {
  kind: string;
  resource: string;
}

export interface WorkspaceDocumentsState {
  tabs: string[];
  active: string;
  preview: string;
}
