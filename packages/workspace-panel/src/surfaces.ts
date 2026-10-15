import type { IconName } from "@tacta/core/icons";

export const surfaces = ["Browser", "Terminal", "Files"] as const;
export type Surface = string;

export interface SurfaceDefinition {
  id: Surface;
  label?: string;
  icon?: IconName;
  key?: string;
}

export const surfaceIcons: Record<Surface, IconName> = {
  Browser: "globe",
  Terminal: "terminal",
  Files: "folderOpen",
};

const surfaceKeys: Record<string, Surface> = { b: "Browser", t: "Terminal", f: "Files" };

export const defaultSurfaceDefinitions: readonly SurfaceDefinition[] = surfaces.map((id) => ({
  id,
  icon: surfaceIcons[id],
  key: Object.entries(surfaceKeys).find(([, value]) => value === id)?.[0],
}));

export function surfaceForKey(
  key: string,
  definitions = defaultSurfaceDefinitions,
): Surface | undefined {
  return definitions.find((surface) => surface.key?.toLowerCase() === key.toLowerCase())?.id;
}

export function surfaceKey(surface: Surface, definitions = defaultSurfaceDefinitions): string {
  return definitions.find((entry) => entry.id === surface)?.key?.toUpperCase() ?? "";
}
