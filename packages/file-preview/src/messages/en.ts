export const en = {
  download: "Download",
  loading: "Loading preview …",
  failed:
    "This file could not be displayed. It may be damaged, encrypted or in an unsupported format. You can download the original.",
  unavailable:
    "A preview is not available for this format yet. Download the file to open it in a suitable application.",
  readOnly: "Read-only preview",
  previous: "Previous page",
  next: "Next page",
  page: "Page",
  ofPages: ({ pages }: { pages: number }) => `of ${pages}`,
  pageOf: ({ page, pages }: { page: number; pages: number }) => `Page ${page} of ${pages}`,
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fit: "Fit to width",
  sheets: "Worksheets",
  filterRows: "Filter rows …",
  rowNumber: "Row number",
  emptySheet: "This worksheet is empty.",
  cells: ({ rows, columns }: { rows: number; columns: number }) =>
    `${rows} rows · ${columns} columns`,
  limited: ({ rows, columns }: { rows: number; columns: number }) =>
    `Preview limited to ${rows} rows and ${columns} columns. The original contains all data.`,
  formulas: "Formulas show saved results. Macros are not executed.",
  word: "Word document",
  wordNote:
    "The preview may differ from Word. The original retains its formatting and page layout.",
  image: "Image preview",
  audio: "Audio preview",
  video: "Video preview",
};
