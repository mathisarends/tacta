export interface PreviewFile {
  path: string;
  content: string;
  encoding: "utf-8" | "base64";
  size: number;
}

export type PreviewKind =
  "text" | "pdf" | "word" | "spreadsheet" | "image" | "audio" | "video" | "download";
export interface FileFormat {
  kind: PreviewKind;
  label: string;
  mime: string;
  extensions: readonly string[];
}

export const fileFormats: readonly FileFormat[] = [
  { kind: "pdf", label: "PDF", mime: "application/pdf", extensions: ["pdf"] },
  {
    kind: "word",
    label: "Word",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: ["docx"],
  },
  {
    kind: "spreadsheet",
    label: "Excel",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: ["xlsx"],
  },
  { kind: "spreadsheet", label: "Excel", mime: "application/vnd.ms-excel", extensions: ["xls"] },
  {
    kind: "spreadsheet",
    label: "Excel",
    mime: "application/vnd.ms-excel.sheet.macroEnabled.12",
    extensions: ["xlsm"],
  },
  {
    kind: "spreadsheet",
    label: "OpenDocument",
    mime: "application/vnd.oasis.opendocument.spreadsheet",
    extensions: ["ods"],
  },
  { kind: "spreadsheet", label: "CSV", mime: "text/csv;charset=utf-8", extensions: ["csv"] },
  {
    kind: "spreadsheet",
    label: "TSV",
    mime: "text/tab-separated-values;charset=utf-8",
    extensions: ["tsv"],
  },
  { kind: "image", label: "PNG", mime: "image/png", extensions: ["png"] },
  { kind: "image", label: "JPEG", mime: "image/jpeg", extensions: ["jpg", "jpeg"] },
  { kind: "image", label: "WebP", mime: "image/webp", extensions: ["webp"] },
  { kind: "image", label: "GIF", mime: "image/gif", extensions: ["gif"] },
  { kind: "image", label: "SVG", mime: "image/svg+xml", extensions: ["svg"] },
  { kind: "image", label: "AVIF", mime: "image/avif", extensions: ["avif"] },
  { kind: "audio", label: "MP3", mime: "audio/mpeg", extensions: ["mp3"] },
  { kind: "audio", label: "WAV", mime: "audio/wav", extensions: ["wav"] },
  { kind: "audio", label: "M4A", mime: "audio/mp4", extensions: ["m4a"] },
  { kind: "audio", label: "OGG", mime: "audio/ogg", extensions: ["ogg", "oga"] },
  { kind: "video", label: "MP4", mime: "video/mp4", extensions: ["mp4", "m4v"] },
  { kind: "video", label: "WebM", mime: "video/webm", extensions: ["webm"] },
  { kind: "video", label: "MOV", mime: "video/quicktime", extensions: ["mov"] },
  { kind: "download", label: "Word", mime: "application/msword", extensions: ["doc"] },
  {
    kind: "download",
    label: "PowerPoint",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extensions: ["pptx"],
  },
  {
    kind: "download",
    label: "PowerPoint",
    mime: "application/vnd.ms-powerpoint",
    extensions: ["ppt"],
  },
  { kind: "download", label: "ZIP", mime: "application/zip", extensions: ["zip"] },
];

export function fileName(path: string): string {
  return path.split(/[\\/]/).at(-1) || path;
}

export function resolveFormat(file: Pick<PreviewFile, "path" | "encoding">): FileFormat {
  const extension = fileName(file.path).split(".").at(-1)?.toLowerCase();
  const known = fileFormats.find((format) => format.extensions.includes(extension ?? ""));
  if (known) {
    return known;
  }
  if (file.encoding === "utf-8") {
    return { kind: "text", label: "UTF-8", mime: "text/plain;charset=utf-8", extensions: [] };
  }
  return {
    kind: "download",
    label: extension?.toUpperCase() ?? "",
    mime: "application/octet-stream",
    extensions: [],
  };
}

export function fileBytes(file: PreviewFile): Uint8Array<ArrayBuffer> {
  if (file.encoding === "utf-8") {
    return new TextEncoder().encode(file.content);
  }
  return Uint8Array.from(atob(file.content), (character) => character.charCodeAt(0));
}

export function fileBlob(file: PreviewFile): Blob {
  return new Blob([fileBytes(file)], { type: resolveFormat(file).mime });
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}
