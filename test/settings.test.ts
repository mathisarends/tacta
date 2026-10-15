import { afterEach, expect, it, vi } from "vitest";
import "@tacta/settings/register";

afterEach(() => document.body.replaceChildren());

it("emits plugin toggle intent while leaving the supplied data under host control", async () => {
  const card = document.createElement("tacta-plugin-card");
  card.plugin = {
    id: "tools",
    name: "Tools",
    description: "Workspace tools",
    enabled: false,
    skills: [],
  };
  const toggle = vi.fn();
  card.addEventListener("plugin-toggle", toggle);
  document.body.append(card);
  await card.updateComplete;
  const button = card.shadowRoot!.querySelector<HTMLButtonElement>("button.activation")!;
  button.click();
  expect(toggle.mock.calls[0]![0].detail).toEqual({ id: "tools", enabled: true });
  expect(card.plugin.enabled).toBe(false);
  card.disabled = true;
  await card.updateComplete;
  button.click();
  expect(toggle).toHaveBeenCalledOnce();
});

it("emits approval preference changes without persisting or applying them itself", async () => {
  const settings = document.createElement("tacta-agent-approval-settings");
  settings.value = { mode: "smart", instructions: "Ask before deleting files." };
  const change = vi.fn();
  settings.addEventListener("approval-settings-change", change);
  document.body.append(settings);
  await settings.updateComplete;
  const radios = settings.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  radios[1]!.click();
  expect(change.mock.calls[0]![0].detail).toEqual({
    mode: "manual",
    instructions: "Ask before deleting files.",
  });
  expect(settings.value.mode).toBe("smart");
});

it("validates and emits a prompt template through the reusable settings dialog", async () => {
  const editor = document.createElement("tacta-prompt-template-editor");
  editor.template = null;
  const save = vi.fn();
  editor.addEventListener("template-save", save);
  document.body.append(editor);
  await editor.updateComplete;
  const inputs = editor.shadowRoot!.querySelectorAll<HTMLInputElement>("input");
  inputs[0]!.value = " Review code ";
  inputs[0]!.dispatchEvent(new Event("input"));
  inputs[1]!.value = "review";
  inputs[1]!.dispatchEvent(new Event("input"));
  const content = editor.shadowRoot!.querySelector<HTMLTextAreaElement>("textarea")!;
  content.value = " Review the workspace changes. ";
  content.dispatchEvent(new Event("input"));
  await editor.updateComplete;
  editor.shadowRoot!.querySelector<HTMLFormElement>("form")!.requestSubmit();
  expect(save.mock.calls[0]![0].detail).toEqual({
    command: "review",
    title: "Review code",
    content: "Review the workspace changes.",
  });
});
