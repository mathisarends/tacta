export const MAX_PREVIEW_ROWS = 500;
export const MAX_PREVIEW_COLUMNS = 50;

export interface SheetCell {
  text: string;
  numeric: boolean;
}
export interface SheetRow {
  number: number;
  cells: SheetCell[];
}
export interface SheetPreview {
  name: string;
  columns: string[];
  rows: SheetRow[];
  limited: boolean;
}
export type SheetRequest =
  | { type: "open"; bytes: ArrayBuffer; delimited: boolean; tabSeparated: boolean }
  | { type: "sheet"; index: number };
export type SheetReply =
  | { type: "names"; names: string[] }
  | { type: "sheet"; index: number; sheet: SheetPreview }
  | { type: "error" };
