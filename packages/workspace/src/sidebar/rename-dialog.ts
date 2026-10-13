import { css, html, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, query, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { AppModal } from "@tacta/core/app-modal";
import "@tacta/core/app-modal";
import type { SidebarItem, SidebarRenameDetail } from "./types.js";
import { sidebarText } from "./messages/index.js";
import { uiText } from "@tacta/core/messages";

export class RenameDialog extends LitElement {
  @property({ attribute: false }) conversation: SidebarItem | null = null;
  @state() private draft = "";
  @query("tacta-modal", true) private modal!: AppModal;
  @query(".rename-input", true) private input!: HTMLInputElement;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("conversation") && this.conversation) {
      this.draft = this.conversation.title;
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("conversation") && this.conversation) {
      void this.focusInput();
    }
  }

  private async focusInput(): Promise<void> {
    await this.modal.updateComplete;
    this.input.focus();
    this.input.select();
  }

  private close(): void {
    this.dispatchEvent(new CustomEvent("rename-cancel", { bubbles: true, composed: true }));
  }

  private submit(event: SubmitEvent): void {
    event.preventDefault();
    const title = this.draft.trim();
    if (!this.conversation || !title) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<SidebarRenameDetail>("rename-conversation", {
        detail: { id: this.conversation.id, title },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onInput(event: InputEvent): void {
    this.draft = (event.target as HTMLInputElement).value;
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: contents;
    }
    .rename-input {
      display: block;
      width: 100%;
      min-width: 0;
      height: 40px;
      padding: 0 12px;
      border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      border-radius: var(--tacta-radius-tab, 8px);
      background: var(--tacta-color-sidebar, #1e1f20);
      color: var(--tacta-color-text, #e6e6e6);
      font: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))
        var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
      transition: border-color var(--tacta-motion-duration-control, 160ms);
    }
    .rename-input:hover {
      border-color: var(--tacta-color-scrollbar-hover, #555658);
    }
    .rename-input:focus,
    .rename-input:focus-visible {
      outline: none;
      border-color: var(--tacta-color-focus, #9b9b9e);
      box-shadow: none;
    }
    .rename-label {
      display: block;
      margin-bottom: 16px;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    }
    .rename-actions {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 20px;
    }
    .rename-actions .button {
      min-height: 34px;
      padding: 6px 16px;
      font-size: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem));
    }
    .rename-actions .button:not(.primary) {
      background: transparent;
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .rename-actions .button:not(.primary):hover {
      background: var(--tacta-color-panel-hover, #2d2e2f);
      color: var(--tacta-color-text, #e6e6e6);
    }
    .rename-actions .button:disabled {
      cursor: not-allowed;
    }
    button:focus-visible {
      outline: 1px solid var(--tacta-color-focus, #9b9b9e);
      outline-offset: 2px;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<tacta-modal
      .open=${this.conversation !== null}
      .heading=${sidebarText.renameConversation}
      @modal-close=${this.close}
    >
      <form @submit=${this.submit}>
        <label class="rename-label" for="conversation-title">${sidebarText.renamePrompt}</label>
        <input
          id="conversation-title"
          class="rename-input"
          name="title"
          autocomplete="off"
          autofocus
          required
          maxlength="80"
          .value=${this.draft}
          @input=${this.onInput}
        />
        <div part="rename-actions" class="rename-actions">
          <button type="button" class="button" @click=${this.close}>${uiText.cancel}</button>
          <button type="submit" class="button primary" ?disabled=${!this.draft.trim()}>
            ${uiText.save}
          </button>
        </div>
      </form>
    </tacta-modal>`;
  }
}
