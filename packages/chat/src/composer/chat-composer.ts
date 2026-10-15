import type { ProviderIconRenderer } from "./model-provider.js";
import { modelProvider, providerIcon } from "./model-provider.js";
import { TactaElement as LitElement } from "@tacta/core/element";
import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { chatComposerStyles } from "./chat-composer.styles.js";
import type { PendingApproval } from "../types.js";
import { repeat } from "lit/directives/repeat.js";
import "../approval-card.js";
import {
  appendTranscript,
  canSendMessage,
  createComposerMessage,
  type ComposerDraft,
} from "./composer-draft.js";
import type { ComposerInput } from "./composer-input.js";
import { expandCommand, selectedCommand, type ComposerCommand } from "./composer-commands.js";
import "./composer-input.js";
import "./composer-toolbar.js";
import "./composer-attachments.js";
import "./composer-dropzone.js";
import "./queued-messages.js";
import type {
  ComposerQuestion,
  ComposerQuestionData,
  ComposerQuestionResponse,
} from "./composer-question.js";
import { chatUiText } from "../messages/index.js";
import "./composer-question.js";
import {
  defaultComposerOptions,
  type ApprovalMode,
  type ChatModelOption,
  type ComposerMessage,
  type ComposerOptions,
  type QueuedMessage,
} from "./options.js";

export class ChatComposer extends LitElement {
  @property({ attribute: false }) providerInfo = modelProvider;
  @property({ attribute: false }) renderProviderIcon: ProviderIconRenderer = providerIcon;
  @property({ type: Boolean }) disabled = false;
  @property({ attribute: false }) optionsDisabled: boolean | undefined;
  @property({ type: Boolean }) running = false;
  @property({ type: Boolean }) stopping = false;
  @property({ type: Boolean }) stopDisabled = false;
  @property({ attribute: false }) queuedMessages: QueuedMessage[] = [];
  @property({ attribute: false }) approvals: PendingApproval[] = [];
  @property() defaultApprovalMode: ApprovalMode = "smart";
  @property({ attribute: false }) options: ComposerOptions = { ...defaultComposerOptions };
  @property({ attribute: false }) models: ChatModelOption[] = [];
  @property({ attribute: false }) value = "";
  @property({ attribute: false }) attachments: File[] = [];
  @property({ attribute: false }) uploadingAttachments: File[] = [];
  @property() context = "";
  @property({ attribute: false }) question: ComposerQuestionData | null = null;
  @property({ attribute: false }) commands: ComposerCommand[] = [];
  @property({ type: Boolean }) commandsLoading = false;
  @property() commandsError = "";
  @property({ type: Boolean }) commandsBelow = false;
  @state() private questionPreview = false;
  @state() private questionNotice = "";
  @state() private dictating = false;
  @state() private interim = "";
  private focusPending = false;

  private get draft(): ComposerDraft {
    return {
      value: this.value,
      attachments: this.attachments,
      uploadingAttachments: this.uploadingAttachments,
      disabled: this.disabled,
      dictating: this.dictating,
    };
  }

  private get input(): ComposerInput | null {
    return this.renderRoot.querySelector("tacta-composer-input");
  }

  private get inputValue(): string {
    if (this.dictating && this.interim) {
      return appendTranscript(this.value, this.interim);
    }
    return this.value;
  }

  private get sendDisabled(): boolean {
    return (
      !canSendMessage(this.draft) ||
      (this.running && this.attachments.length > 0) ||
      (this.commandsLoading && this.value.startsWith("/"))
    );
  }

  private get dropzoneDisabled(): boolean {
    return this.disabled || this.running || this.dictating;
  }

  private get attachmentsDisabled(): boolean {
    return this.disabled || this.running;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("context") && changed.get("context") !== undefined) {
      this.question = null;
      this.questionPreview = false;
      this.questionNotice = "";
    }
  }

  protected override updated(): void {
    if (this.focusPending && !this.disabled) {
      void this.focusInput();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.focusPending = false;
  }

  async focusInput(): Promise<void> {
    await this.updateComplete;
    await this.input?.updateComplete;
    if (!this.isConnected) {
      return;
    }
    this.focusPending = this.disabled;
    if (this.focusPending) {
      return;
    }
    this.input?.focus();
  }

  insertText(text: string): boolean {
    return this.input?.insertText(text) ?? false;
  }

  private async openQuestionPreview(event: CustomEvent<string>): Promise<void> {
    if (event.detail !== "question-preview" || this.disabled) {
      return;
    }
    event.stopPropagation();
    const text = chatUiText.question;
    this.questionPreview = true;
    this.questionNotice = "";
    this.question = {
      id: "ui-preview",
      prompt: text.previewPrompt,
      options: [
        { id: "brief", label: text.previewBrief },
        { id: "detailed", label: text.previewDetailed },
      ],
    };
    await this.updateComplete;
    if (!this.isConnected || !this.questionPreview) {
      return;
    }
    await this.renderRoot.querySelector<ComposerQuestion>("tacta-composer-question")?.focusAnswer();
  }

  private finishQuestion(event: CustomEvent<ComposerQuestionResponse>): void {
    if (this.questionPreview) {
      // Preview responses must never reach the chat's send/queue flow.
      event.stopPropagation();
      if (event.detail.action === "answer") {
        this.questionNotice = chatUiText.question.answered;
      } else if (event.detail.action === "skip") {
        this.questionNotice = chatUiText.question.skipped;
      }
    }
    this.question = null;
    this.questionPreview = false;
    void this.focusInput();
  }

  private setAttachments(files: File[]): void {
    this.attachments = files;
    this.dispatchEvent(
      new CustomEvent("attachments-change", {
        detail: files,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private addFiles(files: File[]): void {
    if (this.disabled || this.running || this.dictating || !files.length) {
      return;
    }
    this.setAttachments([...this.attachments, ...files]);
    void this.focusInput();
  }

  private removeFile(file: File): void {
    if (this.disabled || this.running) {
      return;
    }
    this.setAttachments(this.attachments.filter((item) => item !== file));
    void this.focusInput();
  }

  private send(): void {
    if (this.sendDisabled) {
      return;
    }
    if (selectedCommand(this.value, this.commands)?.kind === "manage") {
      this.dispatchEvent(new CustomEvent("manage-templates", { bubbles: true, composed: true }));
      return;
    }
    if (this.running) {
      this.enqueue();
      return;
    }
    const message = createComposerMessage(this.draft, this.options);
    if (!message) {
      return;
    }
    message.text = expandCommand(message.text, this.commands);
    const accepted = this.dispatchEvent(
      new CustomEvent<ComposerMessage>("send-message", {
        detail: message,
        cancelable: true,
        bubbles: true,
        composed: true,
      }),
    );
    if (!accepted) {
      return;
    }
    this.setAttachments([]);
    this.value = "";
    this.dispatchEvent(
      new CustomEvent("draft-change", { detail: "", bubbles: true, composed: true }),
    );
  }

  private enqueue(): void {
    const message = createComposerMessage(this.draft, this.options);
    if (!message || message.attachments.length) {
      return;
    }
    message.text = expandCommand(message.text, this.commands);
    this.dispatchEvent(
      new CustomEvent<ComposerMessage>("queue-message", {
        detail: message,
        cancelable: true,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private acceptTranscript(event: CustomEvent<string>): void {
    if (this.disabled) {
      return;
    }
    this.value = appendTranscript(this.value, event.detail);
    this.dispatchEvent(
      new CustomEvent("draft-change", { detail: this.value, bubbles: true, composed: true }),
    );
    void this.focusInput();
  }

  static override styles = chatComposerStyles;

  private renderQueue(): TemplateResult<1> | typeof nothing {
    if (!this.queuedMessages.length) {
      return nothing;
    }
    return html`<tacta-queued-messages
      .messages=${this.queuedMessages}
      .running=${this.running}
      .disabled=${this.disabled}
      .steerDisabled=${this.stopDisabled}
    ></tacta-queued-messages>`;
  }

  private renderQuestion(): TemplateResult<1> | typeof nothing {
    if (!this.question) {
      return nothing;
    }
    return html`<tacta-composer-question
      .question=${this.question}
      .preview=${this.questionPreview}
      .disabled=${this.disabled}
      @question-response=${this.finishQuestion}
    ></tacta-composer-question>`;
  }

  private renderApprovals(): TemplateResult<1> | typeof nothing {
    if (!this.approvals.length) {
      return nothing;
    }
    return html`<div class="approval-dock">
      ${repeat(
        this.approvals,
        (approval) => approval.id,
        (approval) =>
          html`<tacta-approval-card docked .approval=${approval}></tacta-approval-card>`,
      )}
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`${this.renderQueue()} ${this.renderQuestion()}
      <div class="question-notice" role="status">${this.questionNotice}</div>
      <div class=${this.approvals.length ? "composer-shell reviewing" : "composer-shell"}>
        ${this.renderApprovals()}
        <tacta-composer-dropzone
          .disabled=${this.dropzoneDisabled}
          .context=${this.context}
          @files-selected=${(event: CustomEvent<File[]>) => this.addFiles(event.detail)}
          @submit-request=${this.send}
        >
          <tacta-composer-attachments
            .files=${this.attachments}
            .uploading=${this.uploadingAttachments}
            .disabled=${this.attachmentsDisabled}
            @remove-file=${(event: CustomEvent<File>) => this.removeFile(event.detail)}
          ></tacta-composer-attachments>
          <tacta-composer-input
            .commandsBelow=${this.commandsBelow}
            .commands=${this.commands}
            .commandsLoading=${this.commandsLoading}
            .commandsError=${this.commandsError}
            .disabled=${this.disabled}
            .readOnly=${this.dictating}
            .value=${this.inputValue}
            @draft-change=${(event: CustomEvent<string>) => (this.value = event.detail)}
          ></tacta-composer-input>
          <tacta-composer-toolbar
            .providerInfo=${this.providerInfo}
            .renderProviderIcon=${this.renderProviderIcon}
            @menu-action=${this.openQuestionPreview}
            .optionsDisabled=${this.optionsDisabled}
            .models=${this.models}
            .defaultApprovalMode=${this.defaultApprovalMode}
            .options=${this.options}
            .disabled=${this.disabled}
            .running=${this.running}
            .stopping=${this.stopping}
            .stopDisabled=${this.stopDisabled}
            .sendDisabled=${this.sendDisabled}
            .hasText=${Boolean(this.value.trim())}
            .dictating=${this.dictating}
            .context=${this.context}
            @options-change=${(event: CustomEvent<ComposerOptions>) => (this.options = event.detail)}
            @dictation-preview=${(event: CustomEvent<string>) => (this.interim = event.detail)}
            @dictation-active=${(event: CustomEvent<boolean>) => (this.dictating = event.detail)}
            @transcript=${this.acceptTranscript}
          ></tacta-composer-toolbar>
        </tacta-composer-dropzone>
      </div>`;
  }
}
