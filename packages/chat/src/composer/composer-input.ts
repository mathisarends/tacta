import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { chatUiText } from "../messages/index.js";
import { tooltip } from "@tacta/core/tooltip";
import { icon } from "@tacta/core/icons";
import {
  commandQuery,
  filterCommands,
  selectedCommand,
  type ComposerCommand,
} from "./composer-commands.js";
import type { ComposerCommandMenu } from "./composer-command-menu.js";
import "./composer-command-menu.js";

export class ComposerInput extends LitElement {
  @property() value = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ attribute: false }) commands: ComposerCommand[] = [];
  @property({ type: Boolean }) commandsLoading = false;
  @property() commandsError = "";
  @property({ type: Boolean, reflect: true, attribute: "commands-below" }) commandsBelow = false;
  @state() private dismissed = false;
  @state() private focused = false;
  @state() private menuSpace = 360;
  private readonly onResize = (): void => this.fitMenu();

  private get menuOpen(): boolean {
    return (
      this.focused &&
      !this.dismissed &&
      !this.disabled &&
      !this.readOnly &&
      commandQuery(this.value) !== null
    );
  }

  private get matchingCommands(): ComposerCommand[] {
    return filterCommands(this.commands, commandQuery(this.value) ?? "");
  }

  private get textarea(): HTMLTextAreaElement | null {
    return this.renderRoot.querySelector("textarea");
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.onResize);
    window.visualViewport?.addEventListener("resize", this.onResize);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.onResize);
    window.visualViewport?.removeEventListener("resize", this.onResize);
    super.disconnectedCallback();
  }

  protected override updated(): void {
    const textarea = this.textarea;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
    this.fitMenu();
  }

  private fitMenu(): void {
    if (!this.menuOpen) {
      return;
    }
    if (this.commandsBelow) {
      const menu = this.renderRoot.querySelector<HTMLElement>("tacta-composer-command-menu");
      const viewport = window.visualViewport;
      const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
      if (menu) {
        this.menuSpace = Math.max(80, bottom - menu.getBoundingClientRect().top - 24);
      }
      return;
    }
    this.menuSpace = Math.max(80, this.getBoundingClientRect().top - 120);
  }

  override focus(options?: FocusOptions): void {
    this.textarea?.focus(options);
  }

  insertText(text: string): boolean {
    const textarea = this.textarea;
    if (!textarea || textarea.disabled || textarea.readOnly || !textarea.getClientRects().length) {
      return false;
    }
    textarea.focus();
    textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, "end");
    this.edit(textarea.value);
    return true;
  }

  private edit(value: string): void {
    const opening = !this.value.startsWith("/") && value.startsWith("/");
    this.dismissed = false;
    this.value = value;
    if (opening) {
      this.dispatchEvent(new CustomEvent("commands-open", { bubbles: true, composed: true }));
    }
    this.dispatchEvent(
      new CustomEvent("draft-change", { detail: value, bubbles: true, composed: true }),
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.isComposing) {
      return;
    }
    if (this.menuOpen && !event.shiftKey) {
      if (this.commandsLoading && (event.key === "Enter" || event.key === "Tab")) {
        event.preventDefault();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        this.dismissed = true;
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        this.renderRoot
          .querySelector<ComposerCommandMenu>("tacta-composer-command-menu")
          ?.focusEdge(event.key === "ArrowUp");
        return;
      }
      if ((event.key === "Enter" || event.key === "Tab") && this.matchingCommands.length) {
        event.preventDefault();
        this.choose(this.matchingCommands[0]!);
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent("submit-request", { bubbles: true, composed: true }));
    }
  }

  private choose(command: ComposerCommand): void {
    if (this.disabled || this.readOnly) {
      return;
    }
    if (command.kind === "manage") {
      this.dispatchEvent(new CustomEvent("manage-templates", { bubbles: true, composed: true }));
      this.dismissed = true;
      return;
    }
    this.edit(command.kind === "skill" ? `/${command.command} ` : command.prompt);
    this.dismissed = true;
    void this.updateComplete.then(() => {
      if (this.isConnected) {
        this.focus();
      }
    });
  }

  private openSkill(command: ComposerCommand): void {
    this.dispatchEvent(
      new CustomEvent<string>("skill-open", {
        detail: command.command,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dismiss(): void {
    this.dismissed = true;
    this.focus();
  }

  private onFocusOut(event: FocusEvent): void {
    if (!this.renderRoot.contains(event.relatedTarget as Node | null)) {
      this.focused = false;
    }
  }

  private onFocusIn(): void {
    if (!this.focused && this.value.startsWith("/")) {
      this.dispatchEvent(new CustomEvent("commands-open", { bubbles: true, composed: true }));
    }
    this.focused = true;
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      position: relative;
    }
    tacta-composer-command-menu {
      position: absolute;
      bottom: calc(100% + 26px);
      left: -14px;
      right: -14px;
      z-index: 5;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-panel, 20px);
      background: var(--tacta-color-menu, var(--tacta-color-surface));
      box-shadow: var(--tacta-shadow-menu, 0 12px 36px #0004);
      overflow: hidden;
    }
    :host([commands-below]) {
      position: static;
    }
    :host([commands-below]) tacta-composer-command-menu {
      top: calc(100% + 16px);
      bottom: auto;
      left: 0;
      right: 0;
    }
    .selected {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 10px 5px;
      padding: 6px 10px;
      color: var(--tacta-color-accent, #ffffff);
      background: var(--tacta-color-surface, #252627);
      border-radius: var(--tacta-radius-pill, 999px);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      cursor: pointer;
    }
    .selected:hover {
      background: var(--tacta-color-panel-hover, #2d2e2f);
      border-color: var(--tacta-color-border-strong, #ffffff1f);
    }
    textarea {
      display: block;
      width: 100%;
      min-height: 68px;
      max-height: 180px;
      padding: 0 5px;
      resize: none;
      overflow-y: auto;
      border: 0;
      background: transparent;
      color: var(--tacta-color-text, #e6e6e6);
      font: var(--tacta-font-weight-body, var(--tacta-font-weight-regular))
        var(--tacta-font-size-chat, var(--tacta-text-xl)) / var(--tacta-line-height-body, 1.6)
        var(--tacta-font-family, system-ui, sans-serif);
      outline: none;
    }
    textarea::placeholder {
      color: var(--tacta-color-muted, #a3a3a5);
    }
    textarea:focus-visible {
      outline: none;
      box-shadow: none;
    }
  `;

  override render(): TemplateResult<1> {
    const selected = selectedCommand(this.value, this.commands);
    return html`<div @focusin=${this.onFocusIn} @focusout=${this.onFocusOut}>
      ${
        this.menuOpen
          ? html`<tacta-composer-command-menu
              id="commands"
              style=${`--composer-commands-max-height: ${this.menuSpace}px`}
              .commands=${this.matchingCommands}
              .loading=${this.commandsLoading}
              .error=${this.commandsError}
              @command-select=${(event: CustomEvent<ComposerCommand>) => this.choose(event.detail)}
              @commands-dismiss=${this.dismiss}
            ></tacta-composer-command-menu>`
          : nothing
      }
      ${selected?.kind === "skill" ? html`<button type="button" class="selected" aria-label=${chatUiText.commands.openSkill({ name: selected.title })} ${tooltip(chatUiText.commands.openSkill({ name: selected.title }))} @click=${() => this.openSkill(selected)}>${icon("sparkles", 16)} ${selected.title}</button>` : nothing}
      <textarea
        ?disabled=${this.disabled}
        ?readonly=${this.readOnly}
        aria-label=${chatUiText.composer.placeholder}
        placeholder=${chatUiText.composer.placeholder}
        .value=${live(this.value)}
        aria-haspopup="menu"
        aria-expanded=${this.menuOpen}
        aria-controls="commands"
        @input=${(event: InputEvent) => this.edit((event.target as HTMLTextAreaElement).value)}
        @keydown=${this.onKeyDown}
      ></textarea>
    </div>`;
  }
}
