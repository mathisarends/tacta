import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { getLocale } from "@tacta/core/i18n";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { SpeechSession, speechConstructor, type SpeechState } from "./speech-session.js";
import { voiceInputStyles } from "./voice-input.styles.js";
import { voiceText } from "./messages/index.js";
import { uiText } from "@tacta/core/messages";

export class VoiceInput extends LitElement {
  @property({ attribute: false }) recognitionFactory = speechConstructor;
  @property({ type: Boolean }) disabled = false;
  @property() context = "";
  @state() private speech: SpeechState = { phase: "idle", transcript: "", error: null };

  private readonly session = new SpeechSession(
    (state) => this.onSpeechChange(state),
    (text) => this.onTranscript(text),
  );

  private get errorMessage(): string {
    switch (this.speech.error) {
      case "not-allowed":
      case "service-not-allowed":
        return voiceText.error.permission;
      case "audio-capture":
        return voiceText.error.microphone;
      case "no-speech":
        return voiceText.error.noSpeech;
      default:
        return voiceText.error.generic;
    }
  }

  private get phaseLabel(): string {
    if (this.speech.phase === "starting") {
      return voiceText.starting;
    }
    if (this.speech.phase === "stopping") {
      return voiceText.finishing;
    }
    if (this.speech.phase === "review") {
      return voiceText.review;
    }
    return voiceText.listening;
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("context") || (changed.has("disabled") && this.disabled)) {
      this.session.cancel();
    }
  }

  override disconnectedCallback(): void {
    this.session.cancel();
    super.disconnectedCallback();
  }

  private onSpeechChange(state: SpeechState): void {
    this.speech = state;
    this.dispatchEvent(
      new CustomEvent<string>("dictation-preview", {
        detail: state.transcript,
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent<boolean>("dictation-active", {
        detail: state.phase !== "idle",
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onTranscript(text: string): void {
    this.dispatchEvent(
      new CustomEvent<string>("transcript", { detail: text, bubbles: true, composed: true }),
    );
  }

  private start(): void {
    const Recognition = this.recognitionFactory();
    if (Recognition && !this.disabled) {
      this.session.start(Recognition, getLocale() === "de" ? "de-DE" : "en-US");
    }
  }

  private onControlsKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.speech.phase !== "idle") {
      event.stopPropagation();
      this.session.cancel();
    }
  }

  static override styles = voiceInputStyles;

  private renderCapture(): TemplateResult<1> {
    const listening = this.speech.phase === "listening";
    const settling = this.speech.phase === "starting" || this.speech.phase === "stopping";
    return html`<span class="status ${listening ? "visually-hidden" : ""}" role="status"
        >${this.phaseLabel}</span
      >
      <span class="wave ${listening ? "listening" : ""}" aria-hidden="true"
        >${Array.from({ length: 12 }, () => html`<span></span>`)}</span
      >
      <button
        part="icon-button"
        class="icon-button"
        type="button"
        ${tooltip(uiText.cancel)}
        aria-label=${uiText.cancel}
        @click=${() => this.session.cancel()}
      >
        ${icon("close", 19)}
      </button>
      <button
        part="icon-button"
        class="icon-button accept"
        type="button"
        ${tooltip(voiceText.accept)}
        aria-label=${voiceText.accept}
        ?disabled=${settling}
        @click=${() => this.session.accept()}
      >
        ${icon("check", 19)}
      </button>`;
  }

  private renderStart(): TemplateResult<1> {
    const supported = Boolean(this.recognitionFactory());
    const label = supported ? voiceText.start : voiceText.unsupported;
    return html`<button
      part="icon-button"
      class="icon-button"
      type="button"
      ${tooltip(label)}
      aria-label=${label}
      ?disabled=${this.disabled || !supported}
      @click=${this.start}
    >
      ${icon("microphone", 20)}
    </button>`;
  }

  private renderError(): TemplateResult<1> | typeof nothing {
    if (!this.speech.error) {
      return nothing;
    }
    return html`<p class="error" role="status">${this.errorMessage}</p>`;
  }

  private renderControls(): TemplateResult<1> {
    if (this.speech.phase !== "idle") {
      return this.renderCapture();
    }
    return this.renderStart();
  }

  override render(): TemplateResult<1> {
    const active = this.speech.phase !== "idle";
    return html`${this.renderError()}
      <div
        part="controls"
        class="controls ${active ? "capture" : ""}"
        @keydown=${this.onControlsKeyDown}
      >
        ${this.renderControls()}
      </div>`;
  }
}
