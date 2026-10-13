import type { de } from "./de.js";

export const en: typeof de = {
  breadcrumb: "Breadcrumb",
  close: "Close",
  withShortcut: ({ label, shortcut }) => (shortcut ? `${label} · ${shortcut}` : label),
  closeItem: ({ name }) => `Close ${name}`,
  itemAction: ({ item, action }) => `${item} · ${action}`,
  cancel: "Cancel",
  save: "Save",
  language: "Select language",
  languageNames: { de: "Deutsch", en: "English" },
  showPassword: "Show password",
  hidePassword: "Hide password",
  validation: {
    required: "Please fill in this field.",
    email: "Please enter a valid email address, e.g. name@example.com.",
    tooShort: ({ min, length }) => `At least ${min} characters, currently ${length}.`,
    invalid: "Please check this entry.",
  },
};
