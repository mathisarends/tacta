import { ComposerCommandMenu } from "./composer/composer-command-menu.js";
import { ApprovalCard } from "./approval-card.js";
import { AssistantMessage } from "./assistant-message.js";
import { ChatAttachment } from "./chat-attachment.js";
import { ChatComposer } from "./composer/chat-composer.js";
import { ChatSendButton } from "./composer/chat-send-button.js";
import { ComposerAttachments } from "./composer/composer-attachments.js";
import { ComposerDropzone } from "./composer/composer-dropzone.js";
import { ComposerInput } from "./composer/composer-input.js";
import { ComposerMenu } from "./composer/composer-menu.js";
import { ComposerQuestion } from "./composer/composer-question.js";
import { ComposerSettings } from "./composer/composer-settings.js";
import { ComposerToolbar } from "./composer/composer-toolbar.js";
import { ModelMenu } from "./composer/model-menu.js";
import { ProviderRail } from "./composer/provider-rail.js";
import { QueuedMessages } from "./composer/queued-messages.js";
import { HumanMessage } from "./human-message.js";
import { ImageViewer } from "./image-viewer.js";
import { ToolCallDetail } from "./tool-calls/tool-call-detail.js";
import { ToolCallItem } from "./tool-calls/tool-call-item.js";
import { ToolCallList } from "./tool-calls/tool-call-list.js";
import { VoiceInput } from "./voice-input/voice-input.js";
import { ChatMessageList } from "./chat-message-list.js";
import { ChatMessageNavigation } from "./chat-message-navigation.js";
import { registerCoreElements } from "@tacta/core/define";

export function registerChatElements(): void {
  registerCoreElements();
  if (!customElements.get("tacta-composer-command-menu")) {
    customElements.define("tacta-composer-command-menu", ComposerCommandMenu);
  }
  if (!customElements.get("tacta-approval-card")) {
    customElements.define("tacta-approval-card", ApprovalCard);
  }
  if (!customElements.get("tacta-assistant-message")) {
    customElements.define("tacta-assistant-message", AssistantMessage);
  }
  if (!customElements.get("tacta-chat-attachment")) {
    customElements.define("tacta-chat-attachment", ChatAttachment);
  }
  if (!customElements.get("tacta-chat-composer")) {
    customElements.define("tacta-chat-composer", ChatComposer);
  }
  if (!customElements.get("tacta-chat-send-button")) {
    customElements.define("tacta-chat-send-button", ChatSendButton);
  }
  if (!customElements.get("tacta-composer-attachments")) {
    customElements.define("tacta-composer-attachments", ComposerAttachments);
  }
  if (!customElements.get("tacta-composer-dropzone")) {
    customElements.define("tacta-composer-dropzone", ComposerDropzone);
  }
  if (!customElements.get("tacta-composer-input")) {
    customElements.define("tacta-composer-input", ComposerInput);
  }
  if (!customElements.get("tacta-composer-menu")) {
    customElements.define("tacta-composer-menu", ComposerMenu);
  }
  if (!customElements.get("tacta-composer-question")) {
    customElements.define("tacta-composer-question", ComposerQuestion);
  }
  if (!customElements.get("tacta-composer-settings")) {
    customElements.define("tacta-composer-settings", ComposerSettings);
  }
  if (!customElements.get("tacta-composer-toolbar")) {
    customElements.define("tacta-composer-toolbar", ComposerToolbar);
  }
  if (!customElements.get("tacta-model-menu")) {
    customElements.define("tacta-model-menu", ModelMenu);
  }
  if (!customElements.get("tacta-provider-rail")) {
    customElements.define("tacta-provider-rail", ProviderRail);
  }
  if (!customElements.get("tacta-queued-messages")) {
    customElements.define("tacta-queued-messages", QueuedMessages);
  }
  if (!customElements.get("tacta-human-message")) {
    customElements.define("tacta-human-message", HumanMessage);
  }
  if (!customElements.get("tacta-image-viewer")) {
    customElements.define("tacta-image-viewer", ImageViewer);
  }
  if (!customElements.get("tacta-tool-call-detail")) {
    customElements.define("tacta-tool-call-detail", ToolCallDetail);
  }
  if (!customElements.get("tacta-tool-call-item")) {
    customElements.define("tacta-tool-call-item", ToolCallItem);
  }
  if (!customElements.get("tacta-tool-call-list")) {
    customElements.define("tacta-tool-call-list", ToolCallList);
  }
  if (!customElements.get("tacta-voice-input")) {
    customElements.define("tacta-voice-input", VoiceInput);
  }
  if (!customElements.get("tacta-chat-message-list")) {
    customElements.define("tacta-chat-message-list", ChatMessageList);
  }
  if (!customElements.get("tacta-chat-message-navigation")) {
    customElements.define("tacta-chat-message-navigation", ChatMessageNavigation);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tacta-composer-command-menu": ComposerCommandMenu;
    "tacta-approval-card": ApprovalCard;
    "tacta-assistant-message": AssistantMessage;
    "tacta-chat-attachment": ChatAttachment;
    "tacta-chat-composer": ChatComposer;
    "tacta-chat-send-button": ChatSendButton;
    "tacta-composer-attachments": ComposerAttachments;
    "tacta-composer-dropzone": ComposerDropzone;
    "tacta-composer-input": ComposerInput;
    "tacta-composer-menu": ComposerMenu;
    "tacta-composer-question": ComposerQuestion;
    "tacta-composer-settings": ComposerSettings;
    "tacta-composer-toolbar": ComposerToolbar;
    "tacta-model-menu": ModelMenu;
    "tacta-provider-rail": ProviderRail;
    "tacta-queued-messages": QueuedMessages;
    "tacta-human-message": HumanMessage;
    "tacta-image-viewer": ImageViewer;
    "tacta-tool-call-detail": ToolCallDetail;
    "tacta-tool-call-item": ToolCallItem;
    "tacta-tool-call-list": ToolCallList;
    "tacta-voice-input": VoiceInput;
    "tacta-chat-message-list": ChatMessageList;
    "tacta-chat-message-navigation": ChatMessageNavigation;
  }
}
