export * from "./question.js";
export { questionText } from "./messages/index.js";
export interface QuestionEventMap {
  "question-response": CustomEvent<import("./question.js").ComposerQuestionResponse>;
}
