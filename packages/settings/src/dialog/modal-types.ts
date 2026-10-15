import type { TemplateResult } from "lit";
import { nothing } from "lit";

export type ModalSize = "default" | "wide";
export type ModalContent = TemplateResult<1> | typeof nothing;

export type ModalOptions = {
  open: boolean;
  heading: string;
  onClose: (event: Event) => void;
};

export type ModalAction = {
  label: string | TemplateResult<1>;
  variant?: "secondary" | "primary" | "danger";
  disabled?: boolean;
  autofocus?: boolean;
} & (
  { type?: "button"; onClick: (event: MouseEvent) => void } | { type: "submit"; onClick?: never }
);

export type ModalForm = {
  onSubmit: (event: SubmitEvent) => void;
  onInput?: (event: Event) => void;
};
