export type PromptTemplate = { id: string; command: string; title: string; content: string };
export type PromptTemplateDraft = Omit<PromptTemplate, "id">;
