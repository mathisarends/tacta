import type { ToolCall } from "../types.js";
import type { IconName } from "@tacta/core/icons";

const kindIcons = {
  search: "search",
  file: "file",
  terminal: "terminal",
  web: "globe",
  memory: "brain",
  skill: "book",
  agent: "bot",
  tool: "tool",
} satisfies Record<ToolCall["kind"], IconName>;

export type ToolCallPresentation = {
  title: string;
  activity: string;
  activityPreview: string;
  icon: IconName;
  inputPreview: string;
  input: string;
  output: string | null;
};

function formatDetail(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function preview(text: string | null): string {
  if (!text) {
    return "";
  }
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

function activityPreview(input: string | null): string {
  if (!input) {
    return "";
  }
  try {
    const parsed: unknown = JSON.parse(input);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const values = parsed as Record<string, unknown>;
      for (const key of [
        "description",
        "path",
        "file_path",
        "url",
        "query",
        "command",
        "skill_name",
        "task",
      ]) {
        const value = values[key];
        if (typeof value === "string" && value.trim()) {
          return preview(value);
        }
      }
    }
  } catch {
    return preview(input);
  }
  return preview(input);
}

export function presentToolCall(toolCall: ToolCall): ToolCallPresentation {
  const words = toolCall.name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim();
  const title = words ? words.charAt(0).toUpperCase() + words.slice(1) : toolCall.name;
  return {
    title,
    activity: title,
    activityPreview: activityPreview(toolCall.inputPreview),
    icon: kindIcons[toolCall.kind] ?? "tool",
    inputPreview: preview(toolCall.inputPreview),
    input: formatDetail(toolCall.inputPreview) ?? "",
    output: formatDetail(toolCall.resultPreview),
  };
}
