import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import {} from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { settingsText } from "./messages/index.js";
import { profileLayoutStyles } from "./profile-card.styles.js";
import "@tacta/core/loading";
import "@tacta/controls";

export class ProfileCardSkeleton extends LitElement {
  static override styles = css`
    ${workspaceStyles}
    ${profileLayoutStyles}
    :host {
      display: block;
    }
    .loading-copy {
      display: grid;
      gap: 10px;
      width: 100%;
    }
    .avatar-skeleton {
      width: 48px;
      height: 48px;
      border-radius: var(--tacta-radius-round, 50%);
      flex: 0 0 auto;
    }
    .name-skeleton {
      width: min(180px, 85%);
      height: 20px;
    }
    .email-skeleton {
      width: min(180px, 70%);
      height: 14px;
    }
    .image-heading-skeleton {
      width: 110px;
      height: 14px;
    }
    .image-hint-skeleton {
      width: min(190px, 100%);
      height: 12px;
    }
    .image-button-skeleton {
      width: 140px;
      height: 36px;
      border-radius: var(--tacta-radius-pill, 999px);
    }
    .sign-out-skeleton {
      width: 110px;
      height: 36px;
      border-radius: var(--tacta-radius-pill, 999px);
    }
  `;

  override render(): TemplateResult<1> {
    return html`<div role="status" aria-busy="true" aria-label=${settingsText.loading}>
      <div class="profile-identity" aria-hidden="true">
        <tacta-skeleton class="avatar-skeleton"></tacta-skeleton>
        <div class="identity-copy loading-copy">
          <tacta-skeleton class="name-skeleton"></tacta-skeleton>
          <tacta-skeleton class="email-skeleton"></tacta-skeleton>
        </div>
        <tacta-skeleton class="sign-out-skeleton trailing"></tacta-skeleton>
      </div>
      <settings-row class="profile-image-row" aria-hidden="true">
        <div slot="heading" class="loading-copy">
          <tacta-skeleton class="image-heading-skeleton"></tacta-skeleton>
          <tacta-skeleton class="image-hint-skeleton"></tacta-skeleton>
        </div>
        <tacta-skeleton slot="control" class="image-button-skeleton"></tacta-skeleton>
      </settings-row>
    </div>`;
  }
}
