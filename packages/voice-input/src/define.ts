import { VoiceInput } from "./voice-input/voice-input.js";
export function registerVoiceInputElements(): void {
  if (!customElements.get("tacta-voice-input")) {
    customElements.define("tacta-voice-input", VoiceInput);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-voice-input": VoiceInput;
  }
}
