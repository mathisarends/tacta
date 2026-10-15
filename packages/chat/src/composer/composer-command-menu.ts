import { TactaElement as LitElement } from "@tacta/core/element";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { composerCommandMenuStyles } from "./composer-command-menu.styles.js";
import { icon } from "@tacta/core/icons";
import { chatUiText } from "../messages/index.js";
import type { ComposerCommand } from "./composer-commands.js";

export class ComposerCommandMenu extends LitElement {
  @property({ attribute: false }) commands: ComposerCommand[] = [];
  @property({ type: Boolean }) loading = false;
  @property() error = "";

  focusEdge(last = false): void {
    const options = this.renderRoot.querySelectorAll<HTMLButtonElement>(".option");
    const index = last ? options.length - 1 : 0;
    options[index]?.focus();
  }

  private select(command: ComposerCommand): void {
    this.dispatchEvent(
      new CustomEvent<ComposerCommand>("command-select", {
        detail: command,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKey(event: KeyboardEvent): void {
    if (event.isComposing) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("commands-dismiss", { bubbles: true, composed: true }));
      return;
    }
    const options = [...this.renderRoot.querySelectorAll<HTMLButtonElement>(".option")];
    const active = options.indexOf(event.target as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = (active + 1) % options.length;
        break;
      case "ArrowUp":
        next = (active + options.length - 1) % options.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = options.length - 1;
        break;
      case "Tab":
        if (!event.shiftKey && this.commands[active]) {
          event.preventDefault();
          this.select(this.commands[active]);
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    options[next]?.focus();
  }

  static override styles = composerCommandMenuStyles;

  private renderStatus(): TemplateResult<1> | typeof nothing {
    if (this.loading) {
      return html`<p class="status" role="status">${chatUiText.commands.loading}</p>`;
    }
    if (this.error) {
      return html`<div class="status" role="status">
        ${this.error}
        <button
          class="button"
          @click=${() => this.dispatchEvent(new CustomEvent("commands-refresh", { bubbles: true, composed: true }))}
        >
          ${chatUiText.commands.retry}
        </button>
      </div>`;
    }
    if (!this.commands.length) {
      return html`<p class="status" role="status">${chatUiText.commands.empty}</p>`;
    }
    return nothing;
  }

  override render(): TemplateResult<1> {
    const text = chatUiText.commands;
    let previous = "";
    return html`<div class="list" role="menu" aria-label=${text.label} @keydown=${this.onKey}>
        ${this.commands.map((command) => {
          const heading = command.kind !== previous && command.kind !== "manage";
          previous = command.kind;
          return html`${heading ? html`<div class="group" role="presentation">${text.groups[command.kind]}</div>` : nothing}
            <button
              class="option"
              role="menuitem"
              tabindex="-1"
              @click=${() => this.select(command)}
            >
              <span class="badge"
                >${icon(command.kind === "skill" ? "sparkles" : "clipboard", 18)}</span
              >
              <span class="copy"
                ><span class="title">${command.title}</span
                ><span class="description">${command.description}</span></span
              >
              <span class="command">/${command.command}</span>
            </button>`;
        })}
      </div>
      ${this.renderStatus()}`;
  }
}
