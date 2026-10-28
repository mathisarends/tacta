import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { setLocale } from "../packages/core/src/index.js";
import "../packages/core/src/register.js";

afterEach(() => {
  document.body.replaceChildren();
  setLocale("en");
});

it("can remove search before its first render and reconnect without a stray modal", async () => {
  const search = document.createElement("tacta-search-bar");
  document.body.append(search);
  search.remove();
  await search.updateComplete;
  expect(search.shadowRoot!.querySelector("dialog")!.open).toBe(false);
  document.body.append(search);
  await search.updateComplete;
  await expect.poll(() => search.shadowRoot!.querySelector("dialog")!.matches(":modal")).toBe(true);
});

it("save status replaces success with a new save and clears the indicator on error", async () => {
  const status = document.createElement("tacta-save-indicator");
  status.savingLabel = "Saving";
  status.savedLabel = "Saved";
  status.state = "saving";
  document.body.append(status);
  await status.updateComplete;
  expect(status.shadowRoot!.querySelector('[role="status"]')!.textContent).toContain("Saving");
  status.state = "saved";
  await expect.poll(() => status.shadowRoot!.querySelector(".success")).not.toBeNull();
  status.state = "saving";
  await status.updateComplete;
  expect(status.shadowRoot!.querySelector(".success")).toBeNull();
  expect(status.shadowRoot!.querySelector("tacta-spinner")).not.toBeNull();
  status.state = "error";
  await status.updateComplete;
  expect(status.shadowRoot!.querySelector("tacta-spinner")).toBeNull();
});

it("submits and resets encapsulated form controls and respects disabled fieldsets", async () => {
  const form = document.createElement("form");
  form.innerHTML = `<fieldset><tacta-text-input name="email" label="Email" type="email" required></tacta-text-input>
    <tacta-checkbox name="updates" label="Updates" required></tacta-checkbox></fieldset>`;
  document.body.append(form);
  const field = form.querySelector("tacta-text-input")!;
  const checkbox = form.querySelector("tacta-checkbox")!;
  await Promise.all([field.updateComplete, checkbox.updateComplete]);
  expect(form.checkValidity()).toBe(false);
  const changed = vi.fn();
  form.addEventListener("value-change", changed);
  await userEvent.fill(field.shadowRoot!.querySelector("input")!, "me@example.com");
  await userEvent.click(checkbox.shadowRoot!.querySelector("input")!);
  await Promise.all([field.updateComplete, checkbox.updateComplete]);
  expect(form.checkValidity()).toBe(true);
  expect(Object.fromEntries(new FormData(form))).toEqual({
    email: "me@example.com",
    updates: "on",
  });
  expect(changed.mock.calls[0]![0].detail).toBe("me@example.com");
  form.querySelector("fieldset")!.disabled = true;
  await Promise.all([field.updateComplete, checkbox.updateComplete]);
  expect(field.shadowRoot!.querySelector("input")!.disabled).toBe(true);
  expect([...new FormData(form)]).toEqual([]);
  form.querySelector("fieldset")!.disabled = false;
  form.reset();
  await Promise.all([field.updateComplete, checkbox.updateComplete]);
  expect(field.value).toBe("");
  expect(checkbox.checked).toBe(false);
});

it("select supports keyboard selection, dynamic options and disabled state", async () => {
  const select = document.createElement("tacta-select");
  select.label = "Theme";
  select.options = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  document.body.append(select);
  const changed = vi.fn();
  document.body.addEventListener("value-change", changed, { once: true });
  await select.updateComplete;
  const trigger = select.shadowRoot!.querySelector("button")!;
  trigger.focus();
  await userEvent.keyboard("{Enter}{End}{Enter}");
  expect(select.value).toBe("dark");
  expect(changed.mock.calls[0]![0].detail).toBe("dark");
  await userEvent.keyboard("{Enter}");
  select.options = [];
  await select.updateComplete;
  await select.updateComplete;
  expect(trigger.disabled).toBe(true);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(select.shadowRoot!.querySelector('[role="listbox"]')).toBeNull();
});

it("pill tabs navigate with roving focus and expose the corresponding slotted panel", async () => {
  const tabs = document.createElement("tacta-pill-tabs");
  tabs.tabs = [
    { id: "chat", label: "Chat" },
    { id: "settings", label: "Settings" },
  ];
  tabs.innerHTML = '<p slot="settings">Preferences</p>';
  document.body.append(tabs);
  await tabs.updateComplete;
  tabs.shadowRoot!.querySelector<HTMLButtonElement>("button")!.focus();
  await userEvent.keyboard("{ArrowRight}");
  await tabs.updateComplete;
  expect(tabs.active).toBe("settings");
  expect(tabs.shadowRoot!.activeElement?.textContent?.trim()).toBe("Settings");
  expect(tabs.shadowRoot!.querySelector<HTMLElement>("#panel-settings")!.hidden).toBe(false);
});

it("pagination emits controlled intent without submitting its surrounding form and translates live", async () => {
  const form = document.createElement("form");
  const pagination = document.createElement("tacta-page-pagination");
  pagination.pageCount = 3;
  form.append(pagination);
  document.body.append(form);
  const pageChange = vi.fn();
  const submit = vi.fn((event: Event) => event.preventDefault());
  form.addEventListener("page-change", pageChange);
  form.addEventListener("submit", submit);
  await pagination.updateComplete;
  pagination.shadowRoot!.querySelector<HTMLButtonElement>(".next")!.click();
  expect(pageChange.mock.calls[0]![0].detail).toBe(2);
  expect(pagination.page).toBe(1);
  expect(submit).not.toHaveBeenCalled();
  setLocale("de");
  await pagination.updateComplete;
  expect(pagination.shadowRoot!.textContent).toContain("Seite 1 von 3");
  pagination.page = 3;
  await pagination.updateComplete;
  expect(pagination.shadowRoot!.querySelector<HTMLButtonElement>(".next")!.disabled).toBe(true);
});

it("search filters local conversations, emits selection, contains focus and restores it on removal", async () => {
  const opener = document.createElement("button");
  opener.textContent = "Search";
  document.body.append(opener);
  opener.focus();
  const search = document.createElement("tacta-search-bar");
  search.conversations = [
    { id: "1", title: "Roadmap", href: "#roadmap" },
    { id: "2", title: "Design", href: "#design" },
  ];
  const action = vi.fn();
  const query = vi.fn();
  search.addEventListener("search-action", action);
  search.addEventListener("search-change", query);
  search.addEventListener("close-search", () => search.remove());
  document.body.append(search);
  await search.updateComplete;
  expect(search.shadowRoot!.querySelector("dialog")!.matches(":modal")).toBe(true);
  const input = search.shadowRoot!.querySelector("input")!;
  await userEvent.fill(input, "road");
  await search.updateComplete;
  expect(search.shadowRoot!.querySelectorAll(".item")).toHaveLength(1);
  expect(query.mock.calls.at(-1)![0].detail).toEqual({ query: "road", filter: "all" });
  await userEvent.keyboard("{Enter}");
  expect(action.mock.calls[0]![0].detail.id).toBe("1");
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  expect(document.activeElement).toBe(search);
  input.focus();
  await userEvent.keyboard("{Escape}");
  expect(search.isConnected).toBe(false);
  expect(document.activeElement).toBe(opener);
});

it("search emits remote retry and pagination intents and renders errors safely", async () => {
  const search = document.createElement("tacta-search-bar");
  search.failed = true;
  document.body.append(search);
  await search.updateComplete;
  const retry = vi.fn();
  search.addEventListener("search-change", retry);
  search.shadowRoot!.querySelector<HTMLButtonElement>(".status-button")!.click();
  expect(retry).toHaveBeenCalledOnce();
  search.failed = false;
  search.hasMore = true;
  search.items = [{ label: "<img src=x onerror=alert(1)>", action: "open", group: "files" }];
  await search.updateComplete;
  const more = vi.fn();
  search.addEventListener("search-more", more);
  search.shadowRoot!.querySelector<HTMLButtonElement>(".status-button")!.click();
  expect(more).toHaveBeenCalledOnce();
  expect(search.shadowRoot!.querySelector("img")).toBeNull();
});

it("settings slots and breadcrumb links preserve content and update default labels with locale", async () => {
  const section = document.createElement("tacta-settings-section");
  section.heading = "Preferences";
  section.innerHTML =
    '<tacta-settings-row heading="Name"><button slot="control">Edit</button></tacta-settings-row>';
  const breadcrumb = document.createElement("tacta-breadcrumb");
  breadcrumb.items = [{ label: "Home", href: "/" }, { label: "Settings" }];
  document.body.append(section, breadcrumb);
  await Promise.all([section.updateComplete, breadcrumb.updateComplete]);
  const row = section.querySelector("tacta-settings-row")!;
  await row.updateComplete;
  expect(
    row.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="control"]')!.assignedElements()[0]
      ?.textContent,
  ).toBe("Edit");
  expect(breadcrumb.shadowRoot!.querySelector("a")!.getAttribute("href")).toBe("/");
  expect(breadcrumb.shadowRoot!.querySelector('[aria-current="page"]')!.textContent).toBe(
    "Settings",
  );
  setLocale("de");
  await breadcrumb.updateComplete;
  expect(breadcrumb.shadowRoot!.querySelector("nav")!.getAttribute("aria-label")).toBe(
    "Brotkrumen",
  );
});
