export interface PluginInfo {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  skills: readonly unknown[];
}
export interface ProfileInfo {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profileImageUrl: string | null;
}
export interface ApprovalSettingsValue {
  mode: "smart" | "manual" | "off";
  instructions: string;
}
