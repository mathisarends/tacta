import type { de } from "./de.js";

export const en: typeof de = {
  start: "Dictate",
  unsupported: "Dictation is not supported by this browser",
  accept: "Insert text",
  starting: "Starting microphone …",
  finishing: "Transcribing …",
  review: "Insert transcript?",
  listening: "Listening …",
  error: {
    permission: "Please allow microphone access in your browser.",
    microphone: "No available microphone found.",
    noSpeech: "No speech detected. Please try again.",
    generic: "Dictation is unavailable right now. Please try again.",
  },
};
