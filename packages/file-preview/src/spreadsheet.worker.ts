import { read, utils, type CellObject } from "xlsx";
import {
  MAX_PREVIEW_COLUMNS,
  MAX_PREVIEW_ROWS,
  type SheetRequest,
  type SheetReply,
  type SheetPreview,
} from "./spreadsheet-types.js";

let bytes: ArrayBuffer;
let delimited = false;
let tabSeparated = false;
let names: string[] = [];

function reply(message: SheetReply): void {
  self.postMessage(message);
}

self.onmessage = (event: MessageEvent<SheetRequest>): void => {
  try {
    const request = event.data;
    if (request.type === "open") {
      bytes = request.bytes;
      delimited = request.delimited;
      tabSeparated = request.tabSeparated;
      const workbook = read(bytes, {
        type: "array",
        bookSheets: true,
        codepage: 65001,
        FS: tabSeparated ? "\t" : undefined,
      });
      names = workbook.SheetNames;
      reply({ type: "names", names });
      return;
    }
    const workbook = read(bytes, {
      type: "array",
      sheets: request.index,
      sheetRows: MAX_PREVIEW_ROWS,
      cellFormula: false,
      cellHTML: false,
      bookVBA: false,
      codepage: 65001,
      raw: delimited,
      FS: tabSeparated ? "\t" : undefined,
    });
    const name = names[request.index];
    if (name === undefined) {
      throw new Error("Worksheet index is out of bounds");
    }
    const source = workbook.Sheets[name];
    const sheet: SheetPreview = { name, columns: [], rows: [], limited: false };
    if (source?.["!ref"]) {
      const range = utils.decode_range(source["!ref"]);
      const full = utils.decode_range((source["!fullref"] as string | undefined) ?? source["!ref"]);
      const lastColumn = Math.min(range.e.c, range.s.c + MAX_PREVIEW_COLUMNS - 1);
      const lastRow = Math.min(range.e.r, range.s.r + MAX_PREVIEW_ROWS - 1);
      sheet.limited = full.e.r > lastRow || full.e.c > lastColumn;
      for (let column = range.s.c; column <= lastColumn; column++) {
        sheet.columns.push(utils.encode_col(column));
      }
      for (let row = range.s.r; row <= lastRow; row++) {
        const cells = sheet.columns.map((_, offset) => {
          const cell = source[utils.encode_cell({ r: row, c: range.s.c + offset })] as
            CellObject | undefined;
          return { text: cell ? utils.format_cell(cell) : "", numeric: cell?.t === "n" };
        });
        sheet.rows.push({ number: row + 1, cells });
      }
    }
    reply({ type: "sheet", index: request.index, sheet });
  } catch {
    reply({ type: "error" });
  }
};
