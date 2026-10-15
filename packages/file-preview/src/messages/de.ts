export const de = {
  download: "Herunterladen",
  loading: "Vorschau wird geladen …",
  failed:
    "Diese Datei konnte nicht angezeigt werden. Sie ist möglicherweise beschädigt, verschlüsselt oder in einem nicht unterstützten Format. Du kannst das Original herunterladen.",
  unavailable:
    "Für dieses Format ist noch keine Vorschau verfügbar. Lade die Datei herunter, um sie in einer passenden Anwendung zu öffnen.",
  readOnly: "Schreibgeschützte Vorschau",
  previous: "Vorherige Seite",
  next: "Nächste Seite",
  page: "Seite",
  ofPages: ({ pages }: { pages: number }) => `von ${pages}`,
  pageOf: ({ page, pages }: { page: number; pages: number }) => `Seite ${page} von ${pages}`,
  zoomIn: "Vergrößern",
  zoomOut: "Verkleinern",
  fit: "An Breite anpassen",
  sheets: "Tabellenblätter",
  filterRows: "Zeilen filtern …",
  rowNumber: "Zeilennummer",
  emptySheet: "Dieses Tabellenblatt ist leer.",
  cells: ({ rows, columns }: { rows: number; columns: number }) =>
    `${rows} Zeilen · ${columns} Spalten`,
  limited: ({ rows, columns }: { rows: number; columns: number }) =>
    `Vorschau auf ${rows} Zeilen und ${columns} Spalten begrenzt. Das Original enthält alle Daten.`,
  formulas: "Formeln zeigen gespeicherte Ergebnisse. Makros werden nicht ausgeführt.",
  word: "Word-Dokument",
  wordNote:
    "Die Darstellung kann von Word abweichen. Das Original behält Formatierung und Seitenlayout.",
  image: "Bildvorschau",
  audio: "Audiovorschau",
  video: "Videovorschau",
};
