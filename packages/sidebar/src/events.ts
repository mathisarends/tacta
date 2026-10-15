import type { SidebarRenameDetail } from "./sidebar/types.js";
export interface SidebarEventMap {
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
