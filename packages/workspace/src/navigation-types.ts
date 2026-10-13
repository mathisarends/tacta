import type { IconName } from "@tacta/core/icons";
import type { Shortcut } from "@tacta/core/keyboard/shortcuts";

export interface NavigationEntry {
  name: string;
  href: string;
  label: string;
  icon: IconName;
  shortcut?: Shortcut;
}
