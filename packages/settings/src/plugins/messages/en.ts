import { format, plural } from "@tacta/core/i18n";
import type { de } from "./de.js";

export const en: typeof de = {
  title: "Plugins",
  intro: "Manage the additional capabilities your agent can use for your account.",
  catalog: "Available plugins",
  summary: ({ enabled, total }) => `${format.number(enabled)} of ${format.number(total)} enabled`,
  active: "Enabled",
  inactive: "Not enabled",
  enable: "Enable",
  disable: "Disable",
  enableLabel: ({ name }) => `Enable ${name}`,
  disableLabel: ({ name }) => `Disable ${name}`,
  skillCount: ({ count }) =>
    plural(count, {
      one: `${format.number(count)} skill`,
      other: `${format.number(count)} skills`,
    }),
  saving: "Saving …",
  saved: "Saved",
  nextRunHint: "Changes apply from the next agent run. Your own skills are preserved.",
  binaryHint:
    "Disabling hides the plugin skills. The preinstalled CLI remains available in the runtime.",
  loading: "Loading plugins …",
  empty: "Plugins made available for Maximus will appear here.",
  retry: "Try again",
  loadFailed: "The plugins could not be loaded.",
  saveFailed: "The change could not be saved. Please try again.",
  notFound: "This plugin is no longer available. Reload the catalog.",
  accountUnavailable: "Please sign in again.",
  openSidebar: "Open sidebar",
};
