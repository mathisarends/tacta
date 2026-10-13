import type { ComposerMessage, ComposerOptions } from "./options.js";

export type ComposerDraft = {
  value: string;
  attachments: readonly File[];
  uploadingAttachments: readonly File[];
  disabled: boolean;
  dictating: boolean;
};

export function canSendMessage(draft: ComposerDraft): boolean {
  return (
    !draft.disabled &&
    !draft.dictating &&
    draft.uploadingAttachments.length === 0 &&
    (draft.value.trim().length > 0 || draft.attachments.length > 0)
  );
}

export function createComposerMessage(
  draft: ComposerDraft,
  options: ComposerOptions,
): ComposerMessage | null {
  if (!canSendMessage(draft)) {
    return null;
  }
  return { ...options, text: draft.value.trim(), attachments: [...draft.attachments] };
}

export function appendTranscript(draft: string, transcript: string): string {
  return [draft.trimEnd(), transcript].filter(Boolean).join(" ");
}
