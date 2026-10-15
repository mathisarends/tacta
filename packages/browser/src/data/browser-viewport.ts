import type { BrowserViewport } from "../types.js";
import type { PageSize } from "./browser-input.js";
import type { BrowserViewMode } from "./browser-types.js";

const maxWidth = 3840;
const maxHeight = 2160;
const fitSize: PageSize = { width: 1920, height: 1080 };

export function browserViewport(
  bounds: PageSize,
  mode: BrowserViewMode,
  pixelRatio: number,
): BrowserViewport {
  const size = mode === "fit" ? fitSize : bounds;
  const width = Math.max(1, Math.min(maxWidth, Math.round(size.width)));
  const height = Math.max(1, Math.min(maxHeight, Math.round(size.height)));
  let density = pixelRatio;
  if (mode === "fit") {
    density *= Math.min(bounds.width / width, bounds.height / height);
  }
  return {
    width,
    height,
    deviceScaleFactor: Math.max(1, Math.min(2, density, maxWidth / width, maxHeight / height)),
  };
}
