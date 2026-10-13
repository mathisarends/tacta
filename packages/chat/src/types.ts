export type Message = {
  id: string;
  sequence?: number;
  renderKey?: string;
  role: "human" | "assistant";
  text: string;
  timestamp: string;
  workedSeconds?: number;
  startedAt?: number;
  attachments?: ChatAttachment[];
  toolCalls?: ToolCall[];
  approvals?: PendingApproval[];
};

export type PendingApproval = {
  id: string;
  action: string;
  reason: string;
  expiresAt: string | null;
  state: "pending" | "allowed" | "denied" | "cancelled";
  busy?: boolean;
  error?: boolean;
};

export type ToolKind =
  "search" | "file" | "terminal" | "web" | "memory" | "skill" | "agent" | "tool";

export type ToolCall = {
  id: string;
  name: string;
  kind: ToolKind;
  inputPreview: string | null;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt: string | null;
  resultPreview: string | null;
  durationSeconds: number | null;
};

export type StoredAttachment = { name: string; type: string; size: number; url: string };
export type ChatAttachment = File | StoredAttachment;
