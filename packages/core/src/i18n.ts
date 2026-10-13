export type Locale = "de" | "en";
let locale: Locale = "en";
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return locale;
}

export function setLocale(next: Locale): void {
  if (next === locale) {
    return;
  }
  locale = next;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type Message = string | ((params: never) => string);
export type Catalog = { readonly [key: string]: Message | Catalog };

export function defineMessages<C extends Catalog>(catalogs: Record<Locale, C>): C {
  const resolve = (path: PropertyKey[]): unknown =>
    path.reduce<unknown>(
      (value, key) => (value as Record<PropertyKey, unknown>)[key],
      catalogs[getLocale()],
    );
  function view(path: PropertyKey[]): object {
    return new Proxy(
      {},
      {
        get(_target, key) {
          const next = [...path, key];
          const value = resolve(next);
          if (typeof value === "object" && value !== null) {
            return view(next);
          }
          return value;
        },
        ownKeys: () => Reflect.ownKeys(resolve(path) as object),
        getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
      },
    );
  }
  return view([]) as C;
}

export function plural(
  count: number,
  forms: Partial<Record<Intl.LDMLPluralRule, string>> & { one: string; other: string },
  language = getLocale(),
): string {
  return forms[new Intl.PluralRules(language).select(count)] ?? forms.other;
}

export const format = {
  number: (value: number): string => new Intl.NumberFormat(getLocale()).format(value),
  time: (value: Date | number): string =>
    new Intl.DateTimeFormat(getLocale(), { hour: "2-digit", minute: "2-digit" }).format(value),
  date: (value: Date | number | string): string =>
    new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium" }).format(new Date(value)),
  dateTime: (value: Date | number | string): string =>
    new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    ),
};
