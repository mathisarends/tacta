import type { de } from "./de.js";

export const en: typeof de = {
  search: "Search",
  escapeKey: "Esc",
  placeholder: "Search …",
  newConversation: "New conversation",
  actions: "Actions",
  conversations: "Conversations",
  all: "All",
  files: "Files",
  filters: "Filter search",
  archived: "Archived",
  fileContext: ({ title }) => `Open in chat · ${title}`,
  unnamedFile: "Unnamed file",
  loading: "Loading search results…",
  loadError: "Some search results could not be loaded.",
  retry: "Try again",
  loadMore: "Load more results",
  empty: "No results",
  navigate: "Navigate",
  select: "Select",
};
