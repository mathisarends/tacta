import { TactaElement as LitElement } from "@tacta/core/element";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import type { SaveIndicatorState } from "@tacta/controls/save-indicator";
import "@tacta/controls/save-indicator";
import type { ApprovalSettingsValue } from "../types.js";
import { agentApprovalSettingsStyles } from "./agent-approval-settings.styles.js";
import { approvalOptions } from "../approval-options.js";
import { settingsText } from "./messages/index.js";

export class AgentApprovalSettings extends LitElement {
  @property({ attribute: false }) value: ApprovalSettingsValue = {
    mode: "smart",
    instructions: "",
  };
  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean }) ready = true;
  @property({ type: Boolean }) saving = false;
  @property({ type: Boolean }) saved = false;
  @property() error = "";
  private change(value: ApprovalSettingsValue): void {
    this.dispatchEvent(
      new CustomEvent<ApprovalSettingsValue>("approval-settings-change", {
        detail: value,
        bubbles: true,
        composed: true,
      }),
    );
  }
  private get approval() {
    return {
      ...this.value,
      loading: this.loading,
      ready: this.ready,
      saving: this.saving,
      saved: this.saved,
      error: this.error,
      dirty: false,
      chooseMode: (mode: ApprovalSettingsValue["mode"]) => this.change({ ...this.value, mode }),
      editInstructions: (instructions: string) => this.change({ ...this.value, instructions }),
      flush: () =>
        this.dispatchEvent(
          new CustomEvent("approval-settings-save", { bubbles: true, composed: true }),
        ),
      load: () =>
        this.dispatchEvent(
          new CustomEvent("approval-settings-reload", { bubbles: true, composed: true }),
        ),
    };
  }

  private get saveState(): SaveIndicatorState {
    if (this.approval.error) {
      return "error";
    }
    if (this.approval.saving || this.approval.dirty) {
      return "saving";
    }
    if (this.approval.saved) {
      return "saved";
    }
    return "idle";
  }

  private onInstructionsInput(event: Event): void {
    this.approval.editInstructions((event.target as HTMLTextAreaElement).value);
  }

  static override styles = agentApprovalSettingsStyles;

  private renderModes(): TemplateResult<1> {
    return html`<div class="modes">
      ${approvalOptions().map(
        (option) =>
          html`<label class="mode">
            <input
              type="radio"
              name="approval-mode"
              .checked=${option.mode === this.approval.mode}
              @change=${() => this.approval.chooseMode(option.mode)}
            />
            <strong>${option.label}</strong>
            <span class="description">${option.description}</span>
          </label>`,
      )}
    </div>`;
  }

  private renderReviewer(): TemplateResult<1> {
    return html`<div class="reviewer">
      <label class="instructions-label" for="reviewer-instructions"
        >${settingsText.approvalInstructions}</label
      >
      <p id="reviewer-hint" class="hint">${settingsText.approvalInstructionsHint}</p>
      <textarea
        id="reviewer-instructions"
        aria-describedby="reviewer-hint"
        placeholder=${settingsText.approvalInstructionsPlaceholder}
        maxlength="4000"
        .value=${this.approval.instructions}
        @input=${this.onInstructionsInput}
        @blur=${() => void this.approval.flush()}
      ></textarea>
    </div>`;
  }

  private renderError(): TemplateResult<1> | typeof nothing {
    if (!this.approval.error) {
      return nothing;
    }
    return html`<p class="error" role="alert">${this.approval.error}</p>
      <button class="button" @click=${() => void this.approval.flush()}>
        ${settingsText.retry}
      </button>`;
  }

  override render(): TemplateResult<1> {
    if (this.approval.loading) {
      return html`<p role="status">${settingsText.approvalLoading}</p>`;
    }
    if (!this.approval.ready) {
      return html`<p class="error" role="alert">${this.approval.error}</p>
        <button class="button" @click=${() => void this.approval.load()}>
          ${settingsText.retry}
        </button>`;
    }
    return html`<section aria-label=${settingsText.approvals}>
      <header>
        <h2>${settingsText.approvals}</h2>
        <p class="intro">${settingsText.approvalScope}</p>
      </header>
      <fieldset>
        <legend>${settingsText.approvalDefault}</legend>
        ${this.renderModes()} ${this.renderReviewer()}
      </fieldset>
      ${this.renderError()}
      <div class="save-note">
        <span>${settingsText.approvalAutosave}</span>
        <save-indicator
          .state=${this.saveState}
          .savingLabel=${settingsText.approvalSaving}
          .savedLabel=${settingsText.approvalSaved}
        ></save-indicator>
      </div>
    </section>`;
  }
}
