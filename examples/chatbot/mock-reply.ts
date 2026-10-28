/** Application-owned demo transport. Replace this generator with your streaming API. */
export async function* streamReply(
  prompt: string,
  signal: AbortSignal,
  fail = false,
): AsyncGenerator<string> {
  const text = /component|library|lit/i.test(prompt)
    ? "Tacta composes a chat from **standard Web Components built with Lit**.\n\n- `@tacta/core` supplies forms, search, settings and navigation.\n- `@tacta/chat` renders messages, tools and the composer.\n- `@tacta/workspace` provides the sidebar and resizable panels.\n\nBind data with `.messages=${this.messages}` and handle intent with `@send-message=${this.send}`. Your application owns the conversation state and transport."
    : "Here is a practical starting point:\n\n1. Define the outcome you want to explore.\n2. Split the work into small, reviewable steps.\n3. Keep the conversation and supporting material side by side.\n\nThis response is **simulated locally**. Try another chat, queue a follow-up, stop a response, or open the workspace settings. No model or network service is connected.";
  for (const chunk of text.match(/.{1,12}/gs) ?? []) {
    signal.throwIfAborted();
    await new Promise<void>((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        reject(signal.reason);
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      }, 35);
      signal.addEventListener("abort", abort, { once: true });
    });
    signal.throwIfAborted();
    if (fail) {
      throw new Error("The demo connection failed. Send a message to try again.");
    }
    yield chunk;
  }
}
