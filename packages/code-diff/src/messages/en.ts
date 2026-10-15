import { format, plural } from "@tacta/core/i18n";
import type { de } from "./de.js";

export const en: typeof de = {
  unchanged: ({ count }) =>
    `${format.number(count)} ${plural(count, { one: "unchanged line", other: "unchanged lines" })}`,
};
