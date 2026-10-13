import { LitElement } from "lit";
import { subscribeLocale } from "./i18n.js";

export class TactaElement extends LitElement {
  private unsubscribeLocale?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.unsubscribeLocale = subscribeLocale(() => this.requestUpdate());
  }

  override disconnectedCallback(): void {
    this.unsubscribeLocale?.();
    this.unsubscribeLocale = undefined;
    super.disconnectedCallback();
  }
}
