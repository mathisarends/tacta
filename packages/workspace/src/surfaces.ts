import type { IconName } from "@tacta/core/icons";

export const surfaces = ["Browser", "Terminal", "Files"] as const;
export type Surface = (typeof surfaces)[number];

export const surfaceIcons: Record<Surface, IconName> = {
  Browser: "globe",
  Terminal: "terminal",
  Files: "folderOpen",
};

const surfaceKeys: Record<string, Surface> = { b: "Browser", t: "Terminal", f: "Files" };

export function surfaceForKey(key: string): Surface | undefined {
  return surfaceKeys[key.toLowerCase()];
}

export function surfaceKey(surface: Surface): string {
  const entry = Object.entries(surfaceKeys).find(([, value]) => value === surface);
  return entry?.[0].toUpperCase() ?? "";
}
