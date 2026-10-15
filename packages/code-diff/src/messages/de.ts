import { format, plural } from "@tacta/core/i18n";

export const de = {
  unchanged: ({ count }: { count: number }) =>
    `${format.number(count)} ${plural(count, { one: "unveränderte Zeile", other: "unveränderte Zeilen" })}`,
};
