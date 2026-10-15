import { settingsText } from "./account/messages/index.js";
import type { ApprovalSettingsValue } from "./types.js";
export function approvalOptions(): {
  mode: ApprovalSettingsValue["mode"];
  label: string;
  description: string;
}[] {
  return [
    {
      mode: "smart",
      label: settingsText.modeSmart,
      description: settingsText.modeSmartDescription,
    },
    {
      mode: "manual",
      label: settingsText.modeManual,
      description: settingsText.modeManualDescription,
    },
    { mode: "off", label: settingsText.modeOff, description: settingsText.modeOffDescription },
  ];
}
