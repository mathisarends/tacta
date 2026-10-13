import type { ProviderIconRenderer } from "./model-provider.js";
import { modelProvider, providerIcon } from "./model-provider.js";
import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { ComposerMenuGroup, ComposerSettingChange } from "./composer-menu.js";
import {
  approvalAccess,
  defaultComposerOptions,
  selectComposerModel,
  type ApprovalMode,
  type ChatModelOption,
  type ComposerOptions,
} from "./options.js";
import { chatUiText } from "../messages/index.js";
import "./composer-menu.js";
import "./model-menu.js";
import { approvalOptions } from "../approval-options.js";
import {
  isKnownReasoningEffort,
  type KnownReasoningEffort,
  type ReasoningEffort,
} from "./reasoning-effort.js";

function labelReasoning(effort: ReasoningEffort): string {
  if (!isKnownReasoningEffort(effort)) {
    return effort.charAt(0).toUpperCase() + effort.slice(1);
  }
  const labels: Record<KnownReasoningEffort, string> = {
    none: chatUiText.composer.none,
    minimal: chatUiText.composer.minimal,
    low: chatUiText.composer.low,
    medium: chatUiText.composer.medium,
    high: chatUiText.composer.high,
    xhigh: chatUiText.composer.extraHigh,
    max: chatUiText.composer.max,
  };
  return labels[effort];
}

export class ComposerSettings extends LitElement {
  @property({ attribute: false }) providerInfo = modelProvider;
  @property({ attribute: false }) renderProviderIcon: ProviderIconRenderer = providerIcon;
  @property({ type: Boolean }) disabled = false;
  @property({ attribute: false }) options: ComposerOptions = { ...defaultComposerOptions };
  @property({ attribute: false }) models: ChatModelOption[] = [];
  @property() defaultApprovalMode: ApprovalMode = "smart";

  private changeSetting(event: CustomEvent<ComposerSettingChange>): void {
    if (this.disabled) {
      return;
    }
    if (event.detail.key === "model") {
      this.options = selectComposerModel(this.options, event.detail.value, this.models);
    } else {
      this.options = { ...this.options, [event.detail.key]: event.detail.value };
    }
    this.dispatchEvent(
      new CustomEvent("options-change", {
        detail: this.options,
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
    }
    .settings {
      display: flex;
      align-items: center;
      min-width: 0;
      gap: 3px;
      flex-wrap: wrap;
    }
    .settings > tacta-composer-menu {
      border-left: 1px solid var(--tacta-color-border, #ffffff0d);
      margin-left: 4px;
      padding-left: 4px;
    }
    @container (max-width: 480px) {
      .settings {
        gap: 0;
      }
    }
  `;

  private renderReasoning(reasoning: ComposerMenuGroup): TemplateResult<1> | typeof nothing {
    if (!reasoning.options.length) {
      return nothing;
    }
    const label = reasoning.options.find(
      (option) => option.value === this.options.reasoning,
    )?.label;
    return html`<tacta-composer-menu
      class="reasoning"
      .heading=${chatUiText.composer.reasoning}
      .label=${label ?? chatUiText.composer.reasoning}
      .groups=${[reasoning]}
      .disabled=${this.disabled}
    ></tacta-composer-menu>`;
  }

  override render(): TemplateResult<1> {
    const currentModel = this.models.find((item) => item.id === this.options.model);
    const reasoning: ComposerMenuGroup = {
      key: "reasoning",
      label: chatUiText.composer.reasoning,
      value: this.options.reasoning,
      options: (currentModel?.reasoningEfforts ?? []).map((effort) => ({
        value: effort,
        label: labelReasoning(effort),
        badge:
          effort === currentModel?.defaultReasoningEffort ? chatUiText.composer.default : undefined,
      })),
    };
    const access: ComposerMenuGroup = {
      key: "access",
      label: chatUiText.composer.accessRun,
      value: this.options.access,
      options: approvalOptions(),
    };
    const defaultOption = access.options.find(
      (option) => option.value === approvalAccess(this.defaultApprovalMode),
    )!;
    access.options.unshift({
      value: "default",
      label: chatUiText.composer.globalDefault,
      description: defaultOption.label,
      icon: defaultOption.icon,
    });
    const selected = access.options.find((option) => option.value === this.options.access)!;
    const selectedLabel = this.options.access === "default" ? defaultOption.label : selected.label;
    return html`<div part="settings" class="settings" @setting-change=${this.changeSetting}>
      <tacta-model-menu
        .providerInfo=${this.providerInfo}
        .renderProviderIcon=${this.renderProviderIcon}
        .models=${this.models}
        .value=${this.options.model}
        .disabled=${this.disabled}
      ></tacta-model-menu>
      ${this.renderReasoning(reasoning)}
      <tacta-composer-menu
        class="access"
        .heading=${chatUiText.composer.access}
        .label=${selectedLabel}
        .symbol=${selected.icon}
        .groups=${[access]}
        .actions=${[{ id: "question-preview", label: chatUiText.question.openPreview, description: chatUiText.question.previewDescription }]}
        .disabled=${this.disabled}
      ></tacta-composer-menu>
    </div>`;
  }
}
