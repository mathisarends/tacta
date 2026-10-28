export const de = {
  pagination: {
    label: "Seitennavigation",
    previous: "Zurück",
    next: "Weiter",
    pageNumber: ({ current, total }: { current: string; total: string }) =>
      `Seite ${current} von ${total}`,
  },
  breadcrumb: "Brotkrumen",
  close: "Schließen",
  withShortcut: ({ label, shortcut }: { label: string; shortcut: string }) =>
    shortcut ? `${label} · ${shortcut}` : label,
  closeItem: ({ name }: { name: string }) => `${name} schließen`,
  itemAction: ({ item, action }: { item: string; action: string }) => `${item} · ${action}`,
  cancel: "Abbrechen",
  save: "Speichern",
  language: "Sprache wählen",
  languageNames: { de: "Deutsch", en: "English" },
  showPassword: "Passwort anzeigen",
  hidePassword: "Passwort verbergen",
  validation: {
    required: "Bitte fülle dieses Feld aus.",
    email: "Bitte gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.",
    tooShort: ({ min, length }: { min: number; length: number }) =>
      `Mindestens ${min} Zeichen, aktuell ${length}.`,
    invalid: "Bitte überprüfe diese Eingabe.",
  },
};
