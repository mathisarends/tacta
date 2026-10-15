export type SpeechResult = { readonly [index: number]: { transcript: string } };
export interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
export type SpeechConstructor = new () => BrowserSpeechRecognition;
export type SpeechState = {
  phase: "idle" | "starting" | "listening" | "stopping" | "review";
  transcript: string;
  error: string | null;
};

export function speechConstructor(): SpeechConstructor | undefined {
  const browser = window as Window & {
    SpeechRecognition?: SpeechConstructor;
    webkitSpeechRecognition?: SpeechConstructor;
  };
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
}

export class SpeechSession {
  state: SpeechState = { phase: "idle", transcript: "", error: null };
  private recognition?: BrowserSpeechRecognition;
  private commitOnEnd = false;
  private readonly notify: (state: SpeechState) => void;
  private readonly commit: (text: string) => void;

  constructor(notify: (state: SpeechState) => void, commit: (text: string) => void) {
    this.notify = notify;
    this.commit = commit;
  }

  private update(patch: Partial<SpeechState>): void {
    this.state = { ...this.state, ...patch };
    this.notify(this.state);
  }

  private release(abort = false): void {
    const recognition = this.recognition;
    this.recognition = undefined;
    if (!recognition) {
      return;
    }
    recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null;
    if (abort) {
      recognition.abort();
    }
  }

  start(Recognition: SpeechConstructor, language: string): void {
    this.cancel();
    const recognition = new Recognition();
    this.recognition = recognition;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
      if (this.recognition === recognition && !this.commitOnEnd) {
        this.update({ phase: "listening" });
      }
    };
    recognition.onresult = (event) => {
      if (this.recognition !== recognition) {
        return;
      }
      this.update({
        transcript: Array.from(event.results, (result) => result[0]?.transcript.trim() ?? "")
          .join(" ")
          .trim(),
      });
    };
    recognition.onerror = ({ error }) => {
      if (this.recognition !== recognition) {
        return;
      }
      this.release(true);
      this.commitOnEnd = false;
      this.update({ phase: this.state.transcript ? "review" : "idle", error });
    };
    recognition.onend = () => {
      if (this.recognition !== recognition) {
        return;
      }
      this.release();
      if (this.commitOnEnd) {
        this.finish();
      } else {
        this.update({
          phase: this.state.transcript ? "review" : "idle",
          error: this.state.transcript ? null : "no-speech",
        });
      }
    };
    this.update({ phase: "starting", transcript: "", error: null });
    try {
      recognition.start();
    } catch {
      this.release();
      this.update({ phase: "idle", error: "start-failed" });
    }
  }

  accept(): void {
    if (this.state.phase === "stopping") {
      return;
    }
    if (!this.recognition) {
      this.finish();
      return;
    }
    this.commitOnEnd = true;
    this.update({ phase: "stopping" });
    this.recognition.stop();
  }

  private finish(): void {
    const text = this.state.transcript.trim();
    this.commitOnEnd = false;
    this.update({ phase: "idle", transcript: "", error: text ? null : "no-speech" });
    if (text) {
      this.commit(text);
    }
  }

  cancel(): void {
    this.commitOnEnd = false;
    this.release(true);
    this.update({ phase: "idle", transcript: "", error: null });
  }
}
