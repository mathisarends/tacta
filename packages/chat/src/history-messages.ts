import { defineMessages } from "@tacta/core/i18n";
export const chatText = defineMessages({
  de: {
    scrollToBottom: "Zum Ende scrollen",
    loadOlder: "Ältere Nachrichten laden",
    loadingHistory: "Wird geladen…",
    navigation: {
      label: "Nachrichten-Navigation",
      message: "Nachricht",
      jump: ({ number, title }: { number: number; title: string }) =>
        `Zu Nachricht ${number}: ${title}`,
    },
  },
  en: {
    scrollToBottom: "Scroll to bottom",
    loadOlder: "Load older messages",
    loadingHistory: "Loading…",
    navigation: {
      label: "Message navigation",
      message: "Message",
      jump: ({ number, title }: { number: number; title: string }) =>
        `Jump to message ${number}: ${title}`,
    },
  },
});
