import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import type { ProfileInfo } from "../types.js";
import { format } from "@tacta/core/i18n";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { settingsText } from "./messages/index.js";
import { profileLayoutStyles } from "./profile-card.styles.js";
import "@tacta/core/loading";
import "@tacta/controls";
import "./profile-card-skeleton.js";
import "@tacta/sidebar";

export class ProfileCard extends LitElement {
  @property({ attribute: false }) user: ProfileInfo | undefined = undefined;
  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean }) imageBusy = false;
  @property({ type: Boolean }) imageRemoving = false;
  @property({ type: Boolean }) disabled = false;

  private get uploadLabel(): string {
    if (this.imageBusy && !this.imageRemoving) {
      return settingsText.uploadingImage;
    }
    if (this.user?.profileImageUrl) {
      return settingsText.changeImage;
    }
    return settingsText.uploadImage;
  }

  private emit<T>(name: string, detail?: T): void {
    this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true }));
  }

  private onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) {
      this.emit("image-select", file);
    }
  }

  private chooseFile(): void {
    this.renderRoot.querySelector<HTMLInputElement>("#profile-image")?.click();
  }

  static override styles = css`
    ${workspaceStyles}
    ${profileLayoutStyles}
    :host {
      display: block;
    }
    .identity-copy h2 {
      margin: 0;
      font-size: var(--tacta-font-size-panel-title, var(--tacta-text-2xl));
      line-height: var(--tacta-line-height-tight, 1.2);
      overflow-wrap: anywhere;
    }
    .member-since {
      margin: 5px 0 0;
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .profile-error {
      min-height: 104px;
      align-content: center;
    }
    .sign-out {
      min-height: 36px;
      padding: 6px 14px;
      gap: 6px;
      background: transparent;
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .profile-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
      min-width: 0;
      gap: 4px;
    }
    .profile-preview {
      --tacta-avatar-size: 48px;
      --tacta-font-size-caption: 16px;
      flex: 0 0 auto;
    }
    .avatar-wrap {
      position: relative;
      border-radius: var(--tacta-radius-round, 50%);
    }
    .avatar-progress {
      position: absolute;
      inset: 0;
      width: auto;
      height: auto;
      border-radius: var(--tacta-radius-round, 50%);
      opacity: 0.75;
    }
    .profile-controls .button {
      min-height: 36px;
      padding: 6px 14px;
    }
    .button.remove-image {
      background: transparent;
      color: var(--tacta-color-muted, #a3a3a5);
      font-weight: var(--tacta-font-weight-regular, 400);
    }
    .button.remove-image:hover:not(:disabled) {
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-text, #e6e6e6);
    }
  `;

  private renderError(): TemplateResult<1> {
    return html`<settings-row class="profile-error" heading=${settingsText.loadError}>
      <span slot="icon" class="setting-icon">${icon("warning", 20)}</span>
      <button
        slot="control"
        class="button retry-profile"
        @click=${() => this.emit("profile-retry")}
      >
        ${settingsText.retry}
      </button>
    </settings-row>`;
  }

  private renderAvatarProgress(): TemplateResult<1> | typeof nothing {
    if (!this.imageBusy) {
      return nothing;
    }
    return html`<tacta-skeleton class="avatar-progress"></tacta-skeleton>`;
  }

  private renderIdentity(user: ProfileInfo): TemplateResult<1> {
    return html`<div class="profile-identity">
      <div class="avatar-wrap" aria-busy=${this.imageBusy}>
        <user-profile
          class="profile-preview"
          avatar-only
          .name=${user.name}
          .src=${user.profileImageUrl ?? ""}
        ></user-profile>
        ${this.renderAvatarProgress()}
      </div>
      <div class="identity-copy">
        <h2>${user.name}</h2>
        <p class="member-since">
          ${settingsText.memberSince({ date: format.date(user.createdAt) })}
        </p>
      </div>
      <button
        class="button sign-out trailing"
        ?disabled=${this.disabled || this.imageBusy}
        @click=${() => this.emit("sign-out")}
      >
        ${icon("logOut", 15)}${settingsText.signOut}
      </button>
    </div>`;
  }

  private renderRemoveButton(user: ProfileInfo): TemplateResult<1> | typeof nothing {
    if (!user.profileImageUrl) {
      return nothing;
    }
    return html`<button
      class="button remove-image"
      ?disabled=${this.imageBusy || this.disabled}
      @click=${() => this.emit("image-remove")}
    >
      ${this.imageRemoving ? settingsText.removingImage : settingsText.removeImage}
    </button>`;
  }

  private renderImage(user: ProfileInfo): TemplateResult<1> {
    return html`<settings-row
      class="profile-image-row"
      heading=${settingsText.profileImage}
      description=${settingsText.profileImageBody}
      aria-busy=${this.imageBusy}
    >
      <div slot="control" class="profile-controls">
        <input
          id="profile-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          @change=${this.onFileChange}
        />
        <button
          class="button"
          ?disabled=${this.imageBusy || this.disabled}
          @click=${this.chooseFile}
        >
          ${this.uploadLabel}
        </button>
        ${this.renderRemoveButton(user)}
      </div>
    </settings-row>`;
  }

  override render(): TemplateResult<1> {
    if (this.loading) {
      return html`<tacta-profile-card-skeleton></tacta-profile-card-skeleton>`;
    }
    if (!this.user) {
      return this.renderError();
    }
    return html`${this.renderIdentity(this.user)}${this.renderImage(this.user)}`;
  }
}
