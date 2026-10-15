export type Point = { x: number; y: number };

export type ImageTool = "draw" | "text" | "erase";

export type Annotation =
  | { type: "draw" | "erase"; points: Point[]; color: string; size: number }
  | { type: "text"; point: Point; text: string; color: string; size: number };

export type ImageTextResult = { text: string | null; focusCanvas: boolean };
