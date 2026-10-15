import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export class UserProfile extends LitElement {
  @property() name = "";
  @property() src = "";
  @property() baseUrl = "";
  @property({ type: Boolean, attribute: "avatar-only" }) avatarOnly = false;
  @state() private imageFailed = false;

  private get initials(): string {
    const parts = this.name.trim().split(/\s+/u).filter(Boolean);
    const first = Array.from(parts[0] ?? "")[0] ?? "";
    const last = parts.length > 1 ? (Array.from(parts.at(-1) ?? "")[0] ?? "") : "";
    return (first + last).toLocaleUpperCase() || "?";
  }

  private get imageUrl(): string {
    if (this.src.startsWith("/")) {
      return `${this.baseUrl.replace(/\/+$/, "")}${this.src}`;
    }
    return this.src;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("src")) {
      this.imageFailed = false;
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      max-width: 100%;
      color: var(--tacta-color-text, #e6e6e6);
      font: var(--tacta-font-weight-body, var(--tacta-font-weight-regular, 400))
        var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))
        var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
    }
    .avatar {
      display: grid;
      place-items: center;
      flex: 0 0 var(--avatar-size, 32px);
      width: var(--avatar-size, 32px);
      height: var(--avatar-size, 32px);
      overflow: hidden;
      border-radius: var(--tacta-radius-round, 50%);
      background: var(--tacta-color-accent-soft, #ffffff14);
      color: var(--tacta-color-accent, #ffffff);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
      font-weight: var(--tacta-font-weight-medium, 500);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .name {
      min-width: 0;
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  private renderAvatar(): TemplateResult<1> | string {
    if (!this.src || this.imageFailed) {
      return this.initials;
    }
    return html`<img src=${this.imageUrl} alt="" @error=${() => (this.imageFailed = true)} />`;
  }

  override render(): TemplateResult<1> {
    return html`
      <span class="avatar" aria-hidden="true">${this.renderAvatar()}</span>
      ${this.avatarOnly ? nothing : html`<span class="name" title=${this.name}>${this.name}</span>`}
    `;
  }
}
