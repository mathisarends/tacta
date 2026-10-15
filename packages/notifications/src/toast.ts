import { toastStore, type ToastKind, type ToastOptions } from "./toast-store.js";
import "./toast-region.js";

function show(kind: ToastKind, message: string, options?: ToastOptions): number {
  if (!document.querySelector("tacta-toast-region")) {
    document.body.append(document.createElement("tacta-toast-region"));
  }
  return toastStore.add(kind, message, options);
}

export const toast = Object.assign(
  (message: string, options?: ToastOptions) => show("info", message, options),
  {
    info: (message: string, options?: ToastOptions) => show("info", message, options),
    success: (message: string, options?: ToastOptions) => show("success", message, options),
    warning: (message: string, options?: ToastOptions) => show("warning", message, options),
    error: (message: string, options?: ToastOptions) => show("error", message, options),
    dismiss: (id?: number) => toastStore.dismiss(id),
  },
);
