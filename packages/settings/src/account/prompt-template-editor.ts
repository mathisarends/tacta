import { TactaElement as LitElement } from "@tacta/core/element";
import { html, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { promptTemplateEditorStyles } from "./prompt-template-editor.styles.js";
import { uiText } from "@tacta/core/messages";
import { settingsText } from "./messages/index.js";
import type { PromptTemplate, PromptTemplateDraft } from "./data/prompt-template-types.js";
import { modal } from "@tacta/settings/dialog";

export class PromptTemplateEditor extends LitElement {
  @property({ attribute: false }) template: PromptTemplate | null | undefined;
  @property({ type: Boolean }) busy = false;
  @property() error = "";
  @state() private command = "";
  @state() private templateTitle = "";
  @state() private content = "";

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("template")) {
      this.command = this.template?.command ?? "";
      this.templateTitle = this.template?.title ?? "";
      this.content = this.template?.content ?? "";
    }
  }

  private emit(name: string): void {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  private save(event: SubmitEvent): void {
    event.preventDefault();
    if (this.busy) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<PromptTemplateDraft>("template-save", {
        detail: {
          command: this.command,
          title: this.templateTitle.trim(),
          content: this.content.trim(),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = promptTemplateEditorStyles;

  override render(): TemplateResult<1> {
    const text = settingsText.templates;
    return modal({
      open: this.template !== undefined,
      heading: this.template ? text.edit : text.create,
      onClose: () => this.emit("template-cancel"),
    })
      .size("wide")
      .busy(this.busy)
      .error(this.error)
      .form({ onSubmit: this.save, onInput: () => this.emit("template-edit") })
      .body(
        html`<div class="editor-fields">
          <p class="intro">${text.editorIntro}</p>
          <div class="fields">
            <label
              >${text.name}<input
                autofocus
                required
                maxlength="100"
                placeholder=${text.namePlaceholder}
                .value=${live(this.templateTitle)}
                ?disabled=${this.busy}
                @input=${(event: Event) => (this.templateTitle = (event.target as HTMLInputElement).value)}
            /></label>
            <label
              >${text.command}<span class="command"
                ><span aria-hidden="true">/prompt/</span
                ><input
                  required
                  pattern="[a-z][a-z0-9-]{0,47}"
                  maxlength="48"
                  placeholder=${text.commandPlaceholder}
                  aria-describedby="command-hint"
                  .value=${live(this.command)}
                  ?disabled=${this.busy}
                  @input=${(event: Event) => (this.command = (event.target as HTMLInputElement).value)} /></span
            ></label>
          </div>
          <p class="hint" id="command-hint">${text.commandHint}</p>
          <label
            >${text.content}<textarea
              required
              maxlength="20000"
              placeholder=${text.contentPlaceholder}
              aria-describedby="content-hint"
              .value=${live(this.content)}
              ?disabled=${this.busy}
              @input=${(event: Event) => (this.content = (event.target as HTMLTextAreaElement).value)}
            ></textarea>
          </label>
          <p class="hint" id="content-hint">${text.contentHint}</p>
        </div>`,
      )
      .action({ label: uiText.cancel, onClick: () => this.emit("template-cancel") })
      .action({ label: this.busy ? text.saving : text.save, variant: "primary", type: "submit" })
      .render();
  }
}
