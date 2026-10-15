import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { icon } from "@tacta/core/icons";
import { questionText } from "./messages/index.js";
import { composerQuestionStyles } from "./question.styles.js";

export interface ComposerQuestionData {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

export type ComposerQuestionResponse =
  | { questionId: string; action: "answer"; answer: string; optionId?: string }
  | { questionId: string; action: "skip" | "dismiss" };

export class ComposerQuestion extends LitElement {
  @property({ attribute: false }) question!: ComposerQuestionData;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) preview = false;
  @state() private selected = "";
  @state() private answer = "";

  private get submitDisabled(): boolean {
    return !this.selected && !this.answer.trim();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("question")) {
      this.selected = "";
      this.answer = "";
    }
  }

  async focusAnswer(): Promise<void> {
    await this.updateComplete;
    if (!this.isConnected) {
      return;
    }
    this.renderRoot.querySelector<HTMLInputElement>('input[type="radio"], textarea')?.focus();
  }

  private respond(action: "answer" | "skip" | "dismiss"): void {
    if (this.disabled) {
      return;
    }
    let detail: ComposerQuestionResponse;
    if (action === "answer") {
      const option = this.question.options.find((item) => item.id === this.selected);
      const answer = this.answer.trim() || option?.label;
      if (!answer) {
        return;
      }
      detail = { questionId: this.question.id, action, answer, optionId: option?.id };
    } else {
      detail = { questionId: this.question.id, action };
    }
    this.dispatchEvent(
      new CustomEvent<ComposerQuestionResponse>("question-response", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || event.isComposing) {
      return;
    }
    event.stopPropagation();
    this.respond("dismiss");
  }

  private onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.respond("answer");
  }

  private selectOption(id: string): void {
    this.selected = id;
    this.answer = "";
  }

  private onAnswerInput(event: InputEvent): void {
    this.answer = (event.target as HTMLTextAreaElement).value;
    this.selected = "";
  }

  private onAnswerKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
      return;
    }
    event.preventDefault();
    this.respond("answer");
  }

  static override styles = composerQuestionStyles;

  override render(): TemplateResult<1> | typeof nothing {
    if (!this.question) {
      return nothing;
    }
    const text = questionText;
    return html`<section aria-labelledby="question-title" @keydown=${this.onKeyDown}>
      <header>
        <span class="heading">${icon("message", 16)}${text.title}</span>
        ${this.preview ? html`<span class="preview">${text.preview}</span>` : nothing}
        <button
          part="icon-button"
          class="icon-button"
          type="button"
          aria-label=${text.close}
          ?disabled=${this.disabled}
          @click=${() => this.respond("dismiss")}
        >
          ${icon("close", 16)}
        </button>
      </header>
      <form @submit=${this.onSubmit}>
        <fieldset ?disabled=${this.disabled}>
          <legend id="question-title">${this.question.prompt}</legend>
          <div part="options" class="options">
            ${this.question.options.map(
              (option, index) =>
                html`<label class="option">
                  <input
                    type="radio"
                    name="answer"
                    value=${option.id}
                    .checked=${this.selected === option.id}
                    @change=${() => this.selectOption(option.id)}
                  />
                  <span class="number" aria-hidden="true">${index + 1}</span>
                  <span class="label">${option.label}</span>
                  <span class="indicator" aria-hidden="true">${icon("arrow", 16)}</span>
                </label>`,
            )}
          </div>
          <div part="footer" class="footer">
            <label class="custom-answer">
              ${icon("pencil", 16)}
              <textarea
                rows="1"
                aria-label=${text.customAnswer}
                placeholder=${text.customAnswer}
                .value=${live(this.answer)}
                @input=${this.onAnswerInput}
                @keydown=${this.onAnswerKeyDown}
              ></textarea>
            </label>
            <div part="actions" class="actions">
              <button
                part="button"
                class="button secondary"
                type="button"
                @click=${() => this.respond("skip")}
              >
                ${text.skip}
              </button>
              <button
                part="button"
                class="button primary"
                type="submit"
                ?disabled=${this.submitDisabled}
              >
                ${text.submit}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </section>`;
  }
}
