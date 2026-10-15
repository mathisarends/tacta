import { ConversationRow } from "./sidebar/conversation-row.js";
import { ProfileMenu } from "./sidebar/profile-menu.js";
import { RenameDialog } from "./sidebar/rename-dialog.js";
import { SideBar } from "./sidebar/side-bar.js";
import { UserProfile } from "./sidebar/user-profile.js";
export function registerSidebarElements(): void {
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
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-conversation-row": ConversationRow;
    "tacta-profile-menu": ProfileMenu;
    "tacta-rename-dialog": RenameDialog;
    "tacta-side-bar": SideBar;
    "tacta-user-profile": UserProfile;
  }
}
