import { html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import type { ChatNavigationEntry } from "./navigation-types.js";
import { chatText } from "./history-messages.js";
import { chatMessageNavigationStyles } from "./chat-message-navigation.styles.js";

export class ChatMessageNavigation extends LitElement {
  @property({ attribute: false }) entries: readonly ChatNavigationEntry[] = [];
  @property() activeId = "";
  @property({ attribute: false }) visibleIds: readonly string[] = [];

  @state() private previewId = "";
  @state() private previewTop = 0;

  private get preview(): ChatNavigationEntry | undefined {
    return this.entries.find((entry) => entry.id === this.previewId);
  }

  private get selectedId(): string {
    return (
      this.entries.find((entry) => entry.id === this.activeId)?.id ?? this.entries[0]?.id ?? ""
    );
  }

  private showPreview(event: Event, id: string): void {
    const button = event.currentTarget as HTMLElement;
    this.previewId = id;
    this.previewTop = button.getBoundingClientRect().top - this.getBoundingClientRect().top;
  }

  private hidePreview(): void {
    this.previewId = "";
  }

  private jump(id: string): void {
    this.dispatchEvent(
      new CustomEvent<string>("message-jump", { detail: id, bubbles: true, composed: true }),
    );
  }

  private navigate(event: KeyboardEvent, index: number): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.hidePreview();
      return;
    }
    if (!isRovingKey(event.key, "vertical")) {
      return;
    }
    event.preventDefault();
    const next = rovingIndex(event.key, index, this.entries.length, "vertical");
    const button = this.renderRoot.querySelectorAll<HTMLButtonElement>("button")[next];
    button?.focus();
  }

  static override styles = chatMessageNavigationStyles;

  private renderPreview(): TemplateResult<1> | typeof nothing {
    const entry = this.preview;
    if (!entry) {
      return nothing;
    }
    return html`<div
      part="preview"
      class="preview"
      id="message-preview"
      role="tooltip"
      style=${`--preview-top:${this.previewTop}px`}
    >
      <strong>${entry.title || chatText.navigation.message}</strong>
      <p>${entry.preview}</p>
    </div>`;
  }

  private renderMarker(entry: ChatNavigationEntry, index: number): TemplateResult<1> {
    const selected = entry.id === this.selectedId;
    const title = entry.title || chatText.navigation.message;
    const label = chatText.navigation.jump({ number: index + 1, title });
    return html`<button
      type="button"
      aria-label=${label}
      aria-current=${selected ? "location" : "false"}
      ?data-visible=${this.visibleIds.includes(entry.id)}
      aria-describedby=${this.previewId === entry.id ? "message-preview" : nothing}
      tabindex=${selected ? 0 : -1}
      @pointerenter=${(event: PointerEvent) => this.showPreview(event, entry.id)}
      @focus=${(event: FocusEvent) => this.showPreview(event, entry.id)}
      @blur=${this.hidePreview}
      @keydown=${(event: KeyboardEvent) => this.navigate(event, index)}
      @click=${() => this.jump(entry.id)}
    >
      <span class="marker"></span>
    </button>`;
  }

  override render(): TemplateResult<1> {
    return html`<nav aria-label=${chatText.navigation.label} @pointerleave=${this.hidePreview}>
      <div part="markers" class="markers" @scroll=${this.hidePreview}>
        ${repeat(
          this.entries,
          (entry) => entry.id,
          (entry, index) => this.renderMarker(entry, index),
        )}
      </div>
      ${this.renderPreview()}
    </nav>`;
  }
}
