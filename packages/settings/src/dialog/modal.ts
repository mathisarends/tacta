import { html, nothing, type TemplateResult } from "lit";
import type {
  ModalAction,
  ModalContent,
  ModalForm,
  ModalOptions,
  ModalSize,
} from "./modal-types.js";
import "./app-modal.js";

type Parts = {
  body: ModalContent;
  actions: readonly ModalAction[];
  error: string;
  busy: boolean;
  size: ModalSize;
  form?: ModalForm;
};

export class ModalBuilder {
  constructor(
    private readonly options: ModalOptions,
    private readonly parts: Parts = {
      body: nothing,
      actions: [],
      error: "",
      busy: false,
      size: "default",
    },
  ) {}

  body(content: ModalContent): ModalBuilder {
    return this.with({ body: content });
  }

  action(action: ModalAction): ModalBuilder {
    return this.with({ actions: [...this.parts.actions, action] });
  }

  error(message: string): ModalBuilder {
    return this.with({ error: message });
  }

  busy(busy: boolean): ModalBuilder {
    return this.with({ busy });
  }

  size(size: ModalSize): ModalBuilder {
    return this.with({ size });
  }

  form(form: ModalForm): ModalBuilder {
    return this.with({ form });
  }

  render(): TemplateResult<1> {
    return html`<tacta-settings-dialog
      .open=${this.options.open}
      .heading=${this.options.heading}
      .busy=${this.parts.busy}
      .size=${this.parts.size}
      @modal-close=${this.options.onClose}
      >${this.renderContent()}</tacta-settings-dialog
    >`;
  }

  private with(parts: Partial<Parts>): ModalBuilder {
    return new ModalBuilder(this.options, { ...this.parts, ...parts });
  }

  private renderAction(action: ModalAction): TemplateResult<1> {
    const disabled = this.parts.busy || action.disabled === true;
    return html`<button
      type=${action.type ?? "button"}
      class="button ${action.variant ?? "secondary"}"
      ?disabled=${disabled}
      ?autofocus=${action.autofocus}
      @click=${action.onClick}
    >
      ${action.label}
    </button>`;
  }

  private renderParts(): TemplateResult<1> {
    return html`<div class="modal-body">${this.parts.body}</div>
      ${this.parts.error ? html`<p class="modal-error" role="alert">${this.parts.error}</p>` : nothing}
      ${this.parts.actions.length ? html`<footer class="modal-actions">${this.parts.actions.map((action) => this.renderAction(action))}</footer>` : nothing}`;
  }

  private renderContent(): TemplateResult<1> {
    const form = this.parts.form;
    if (!form) {
      return this.renderParts();
    }
    return html`<form class="modal-form" @submit=${form.onSubmit} @input=${form.onInput}>
      ${this.renderParts()}
    </form>`;
  }
}

export function modal(options: ModalOptions): ModalBuilder {
  return new ModalBuilder(options);
}
