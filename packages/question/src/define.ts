import { ComposerQuestion } from "./question.js";
export function registerQuestionElements(): void {
  if (!customElements.get("tacta-composer-question")) {
    customElements.define("tacta-composer-question", ComposerQuestion);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-composer-question": ComposerQuestion;
  }
}
