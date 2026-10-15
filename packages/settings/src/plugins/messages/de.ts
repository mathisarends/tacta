import { format, plural } from "@tacta/core/i18n";

export const de = {
  title: "Plugins",
  intro: "Verwalte die zusätzlichen Fähigkeiten deines Agenten für dein Konto.",
  catalog: "Verfügbare Plugins",
  summary: ({ enabled, total }: { enabled: number; total: number }) =>
    `${format.number(enabled)} von ${format.number(total)} aktiviert`,
  active: "Aktiviert",
  inactive: "Nicht aktiviert",
  enable: "Aktivieren",
  disable: "Deaktivieren",
  enableLabel: ({ name }: { name: string }) => `${name} aktivieren`,
  disableLabel: ({ name }: { name: string }) => `${name} deaktivieren`,
  skillCount: ({ count }: { count: number }) =>
    plural(count, {
      one: `${format.number(count)} Skill`,
      other: `${format.number(count)} Skills`,
    }),
  saving: "Wird gespeichert …",
  saved: "Gespeichert",
  nextRunHint: "Änderungen greifen beim nächsten Agentenlauf. Eigene Skills bleiben erhalten.",
  binaryHint:
    "Deaktivierung blendet die Plugin-Skills aus. Die vorinstallierte CLI bleibt in der Runtime verfügbar.",
  loading: "Plugins werden geladen …",
  empty: "Hier erscheinen die Plugins, die für Maximus bereitgestellt werden.",
  retry: "Erneut versuchen",
  loadFailed: "Die Plugins konnten nicht geladen werden.",
  saveFailed: "Die Änderung konnte nicht gespeichert werden. Bitte versuche es erneut.",
  notFound: "Dieses Plugin ist nicht mehr verfügbar. Lade den Katalog neu.",
  accountUnavailable: "Bitte melde dich erneut an.",
  openSidebar: "Seitenleiste öffnen",
};
