export type ComposerCommand = {
  command: string;
  title: string;
  description: string;
  kind: "skill" | "prompt" | "manage";
  prompt: string;
};

export function commandQuery(value: string): string | null {
  const match = /^\/([^\s]*)$/.exec(value);
  return match ? (match[1] ?? "").toLocaleLowerCase() : null;
}

export function filterCommands(
  commands: readonly ComposerCommand[],
  query: string,
): ComposerCommand[] {
  return commands.filter((item) =>
    `${item.command} ${item.title} ${item.description}`.toLocaleLowerCase().includes(query),
  );
}

export function selectedCommand(
  value: string,
  commands: readonly ComposerCommand[],
): ComposerCommand | undefined {
  const token = value.split(/\s/, 1)[0];
  // nosemgrep: eslint.detect-possible-timing-attacks, nodejs_scan.javascript-crypto-rule-node_timing_attack
  return commands.find((item) => `/${item.command}` === token);
}

export function expandCommand(value: string, commands: readonly ComposerCommand[]): string {
  const command = selectedCommand(value, commands);
  if (!command || command.kind === "manage") {
    return value;
  }
  const argument = value.slice(command.command.length + 1).trim();
  return [command.prompt, argument].filter(Boolean).join("\n\n");
}
