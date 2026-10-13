import type { ApprovalDecision } from "./approval-card.js";
import type { ComposerMessage, ComposerOptions } from "./composer/options.js";
import type { ComposerQuestionResponse } from "./composer/composer-question.js";
import type { ComposerSettingChange } from "./composer/composer-menu.js";

export interface ChatEventMap {
  "send-message": CustomEvent<ComposerMessage>;
  "queue-message": CustomEvent<ComposerMessage>;
  "draft-change": CustomEvent<string>;
  "attachments-change": CustomEvent<File[]>;
  "files-selected": CustomEvent<File[]>;
  "options-change": CustomEvent<ComposerOptions>;
  "setting-change": CustomEvent<ComposerSettingChange>;
  "resolve-approval": CustomEvent<ApprovalDecision>;
  "question-response": CustomEvent<ComposerQuestionResponse>;
  "dictation-preview": CustomEvent<string>;
  "dictation-active": CustomEvent<boolean>;
  transcript: CustomEvent<string>;
  "message-jump": CustomEvent<string>;
  "load-older": CustomEvent<void>;
  "stop-run": CustomEvent<void>;
  "remove-queued": CustomEvent<string>;
  "steer-queued": CustomEvent<string>;
  "send-queued": CustomEvent<string>;
}
