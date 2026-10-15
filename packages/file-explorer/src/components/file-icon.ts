import { html, type TemplateResult } from "lit";
import python from "@iconify-icons/vscode-icons/file-type-python";
import javascript from "@iconify-icons/vscode-icons/file-type-js-official";
import typescript from "@iconify-icons/vscode-icons/file-type-typescript-official";
import react from "@iconify-icons/vscode-icons/file-type-reactjs";
import reactTs from "@iconify-icons/vscode-icons/file-type-reactts";
import htmlIcon from "@iconify-icons/vscode-icons/file-type-html";
import css from "@iconify-icons/vscode-icons/file-type-css";
import scss from "@iconify-icons/vscode-icons/file-type-scss";
import json from "@iconify-icons/vscode-icons/file-type-json";
import markdown from "@iconify-icons/vscode-icons/file-type-markdown";
import npm from "@iconify-icons/vscode-icons/file-type-npm";
import yaml from "@iconify-icons/vscode-icons/file-type-yaml";
import toml from "@iconify-icons/vscode-icons/file-type-toml";
import docker from "@iconify-icons/vscode-icons/file-type-docker";
import shell from "@iconify-icons/vscode-icons/file-type-shell";
import powershell from "@iconify-icons/vscode-icons/file-type-powershell";
import rust from "@iconify-icons/vscode-icons/file-type-light-rust";
import go from "@iconify-icons/vscode-icons/file-type-go";
import java from "@iconify-icons/vscode-icons/file-type-java";
import c from "@iconify-icons/vscode-icons/file-type-c";
import cpp from "@iconify-icons/vscode-icons/file-type-cpp";
import csharp from "@iconify-icons/vscode-icons/file-type-csharp";
import php from "@iconify-icons/vscode-icons/file-type-php";
import ruby from "@iconify-icons/vscode-icons/file-type-ruby";
import git from "@iconify-icons/vscode-icons/file-type-git";
import sql from "@iconify-icons/vscode-icons/file-type-sql";
import vue from "@iconify-icons/vscode-icons/file-type-vue";
import svelte from "@iconify-icons/vscode-icons/file-type-svelte";
import xml from "@iconify-icons/vscode-icons/file-type-xml";
import svg from "@iconify-icons/vscode-icons/file-type-svg";
import image from "@iconify-icons/vscode-icons/file-type-image";
import pdf from "@iconify-icons/vscode-icons/file-type-pdf";
import word from "@iconify-icons/vscode-icons/file-type-word";
import excel from "@iconify-icons/vscode-icons/file-type-excel";
import powerpoint from "@iconify-icons/vscode-icons/file-type-powerpoint";
import audio from "@iconify-icons/vscode-icons/file-type-audio";
import video from "@iconify-icons/vscode-icons/file-type-video";
import zip from "@iconify-icons/vscode-icons/file-type-zip";
import text from "@iconify-icons/vscode-icons/file-type-text";
import config from "@iconify-icons/vscode-icons/file-type-config";
import { icon, type IconName } from "@tacta/core/icons";

// Bundle only these local assets. SVG images keep each icon's gradients isolated.
const assets = {
  python,
  javascript,
  typescript,
  react,
  reactTs,
  html: htmlIcon,
  css,
  scss,
  json,
  // The upstream brown Markdown mark needs more contrast on our dark surfaces.
  markdown: { ...markdown, body: markdown.body.replaceAll("#755838", "#9ccaff") },
  npm,
  yaml,
  toml,
  docker,
  shell,
  powershell,
  rust,
  go,
  java,
  c,
  cpp,
  csharp,
  php,
  ruby,
  git,
  sql,
  vue,
  svelte,
  xml,
  svg,
  image,
  pdf,
  word,
  excel,
  powerpoint,
  audio,
  video,
  zip,
  text,
  config,
};
type FileType = keyof typeof assets;
const sources = new Map<FileType, string>(
  Object.entries(assets).map(([name, data]) => [
    name as FileType,
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${data.width ?? 32} ${data.height ?? 32}">${data.body}</svg>`)}`,
  ]),
);

const extensions = new Map<string, FileType>();
const groups: [FileType, string][] = [
  ["python", "py pyw pyi ipynb"],
  ["javascript", "js mjs cjs"],
  ["typescript", "ts mts cts"],
  ["react", "jsx"],
  ["reactTs", "tsx"],
  ["html", "html htm"],
  ["css", "css"],
  ["scss", "scss sass less"],
  ["json", "json jsonc json5 jsonl ndjson"],
  ["markdown", "md markdown mkd mdx"],
  ["yaml", "yaml yml"],
  ["toml", "toml"],
  ["shell", "sh bash zsh fish"],
  ["powershell", "ps1 psm1 psd1"],
  ["rust", "rs"],
  ["go", "go"],
  ["java", "java jar"],
  ["c", "c h"],
  ["cpp", "cpp cc cxx hpp hxx"],
  ["csharp", "cs csx"],
  ["php", "php phtml"],
  ["ruby", "rb erb"],
  ["sql", "sql sqlite sqlite3 db"],
  ["vue", "vue"],
  ["svelte", "svelte"],
  ["xml", "xml xsl xsd"],
  ["svg", "svg"],
  ["image", "png jpg jpeg gif webp avif ico bmp tiff"],
  ["pdf", "pdf"],
  ["word", "doc docx odt rtf"],
  ["excel", "xls xlsx xlsm ods csv tsv"],
  ["powerpoint", "ppt pptx odp"],
  ["audio", "mp3 wav m4a ogg oga flac"],
  ["video", "mp4 m4v webm mov avi"],
  ["zip", "zip gz tgz tar bz2 xz 7z rar"],
  ["text", "txt log"],
  ["config", "ini cfg conf env"],
];
for (const [type, suffixes] of groups) {
  for (const suffix of suffixes.split(" ")) {
    extensions.set(suffix, type);
  }
}

const filenames = new Map<string, FileType>(
  Object.entries({
    "package.json": "npm",
    "package-lock.json": "npm",
    "npm-shrinkwrap.json": "npm",
    ".npmrc": "npm",
    dockerfile: "docker",
    containerfile: "docker",
    ".dockerignore": "docker",
    "compose.yaml": "docker",
    "compose.yml": "docker",
    "docker-compose.yaml": "docker",
    "docker-compose.yml": "docker",
    ".gitignore": "git",
    ".gitattributes": "git",
    ".gitmodules": "git",
    ".bashrc": "shell",
    ".bash_profile": "shell",
    ".zshrc": "shell",
    ".profile": "shell",
  } satisfies Record<string, FileType>),
);

export function fileIcon(path: string, size = 16, fallback: IconName = "file"): TemplateResult {
  const filename = path.split(/[\\/]/).at(-1)?.toLowerCase() ?? "";
  let type = filenames.get(filename);
  if (!type && /^(?:dockerfile|containerfile)\./.test(filename)) {
    type = "docker";
  }
  if (!type && /^\.env(?:\.|$)/.test(filename)) {
    type = "config";
  }
  if (!type && filename.includes(".")) {
    type = extensions.get(filename.split(".").at(-1) ?? "");
  }
  if (!type) {
    return icon(fallback, size);
  }
  return html`<img
    src=${sources.get(type)!}
    width=${size}
    height=${size}
    alt=""
    aria-hidden="true"
    draggable="false"
  />`;
}
