import { afterEach, expect, it, vi } from "vitest";
import { setLocale } from "@tacta/core/i18n";
import { ToastStore } from "@tacta/notifications";
import "@tacta/controls/register";
import "@tacta/search/register";
import "@tacta/file-explorer/register";
import "@tacta/notifications/register";
import "@tacta/workspace-panel/register";

afterEach(() => {
  document.body.replaceChildren();
  setLocale("en");
});

it("restores externally supplied explorer state without emitting a persistence feedback loop", async () => {
  const explorer = document.createElement("tacta-document-explorer");
  explorer.entries = [{ id: "notes", path: "docs/notes.md" }];
  explorer.state = { collapsed: ["docs"], revealed: [] };
  const change = vi.fn();
  explorer.addEventListener("explorer-state-change", change);
  document.body.append(explorer);
  await explorer.updateComplete;
  expect(change).not.toHaveBeenCalled();
  const folder = explorer.shadowRoot!.querySelector("tacta-explorer-folder-row")!;
  await folder.updateComplete;
  folder.shadowRoot!.querySelector<HTMLButtonElement>("button")!.click();
  await explorer.updateComplete;
  expect(change).toHaveBeenCalledOnce();
});

it("exposes custom workspace surfaces and only their configured keyboard shortcuts", async () => {
  const picker = document.createElement("tacta-surface-picker");
  picker.surfaces = [{ id: "graph", label: "Knowledge graph", icon: "chart", key: "g" }];
  const open = vi.fn();
  picker.addEventListener("surface-open", open);
  document.body.append(picker);
  await picker.updateComplete;
  expect(picker.shadowRoot!.textContent).toContain("Knowledge graph");
  expect(picker.shadowRoot!.textContent).not.toContain("Terminal");
  picker.dispatchEvent(new KeyboardEvent("keydown", { key: "t", bubbles: true }));
  expect(open).not.toHaveBeenCalled();
  picker.dispatchEvent(new KeyboardEvent("keydown", { key: "g", bubbles: true }));
  expect(open.mock.calls[0]![0].detail).toBe("graph");
});

it("filters file entries and emits file intent without reading storage or a backend", async () => {
  const explorer = document.createElement("tacta-document-explorer");
  explorer.entries = [
    { id: "notes", path: "docs/notes.md" },
    { id: "script", path: "src/script.ts" },
  ];
  const open = vi.fn();
  explorer.addEventListener("document-open", open);
  document.body.append(explorer);
  await explorer.updateComplete;
  const input = explorer.shadowRoot!.querySelector<HTMLInputElement>("input")!;
  input.value = "notes";
  input.dispatchEvent(new InputEvent("input"));
  await explorer.updateComplete;
  const rows = explorer.shadowRoot!.querySelectorAll("tacta-explorer-file-row");
  expect(rows).toHaveLength(1);
  const row = rows[0]!;
  await row.updateComplete;
  const button =
    row.shadowRoot!.querySelector<HTMLButtonElement>(".file") ??
    row.shadowRoot!.querySelector<HTMLButtonElement>("button")!;
  button.click();
  expect(open.mock.calls[0]![0].detail).toBe("notes");
});

it("keeps notification stores independent and switches subscriptions when configured", async () => {
  const first = new ToastStore();
  const second = new ToastStore();
  const region = document.createElement("tacta-toast-region");
  region.store = first;
  document.body.append(region);
  await region.updateComplete;
  first.add("success", "First workspace", { duration: Infinity });
  await region.updateComplete;
  expect(region.shadowRoot!.textContent).toContain("First workspace");
  region.store = second;
  await region.updateComplete;
  await region.updateComplete;
  second.add("info", "Second workspace", { duration: Infinity });
  await region.updateComplete;
  expect(region.shadowRoot!.textContent).toContain("Second workspace");
  expect(region.shadowRoot!.textContent).not.toContain("First workspace");
  first.dismiss();
  second.dismiss();
});

it("emits locale choices so the host can choose its own persistence behavior", async () => {
  const control = document.createElement("tacta-locale-switch");
  const change = vi.fn();
  control.addEventListener("locale-change", change);
  document.body.append(control);
  await control.updateComplete;
  const buttons = control.shadowRoot!.querySelectorAll<HTMLButtonElement>("button");
  const german = [...buttons].find((button) => button.textContent?.toLowerCase().includes("de"))!;
  german.click();
  expect(change.mock.calls[0]![0].detail).toBe("de");
  expect(control.locale).toBe("en");
});
