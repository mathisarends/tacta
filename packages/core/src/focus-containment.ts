export function focusableControls(root: Element | ShadowRoot): HTMLElement[] {
  const controls: HTMLElement[] = [];
  const visit = (element: Element): void => {
    if (!(element instanceof HTMLElement) || !element.checkVisibility()) {
      return;
    }
    if (element.tabIndex >= 0 && !element.matches(":disabled, [inert]")) {
      controls.push(element);
    }
    if (element instanceof HTMLSlotElement) {
      element.assignedElements({ flatten: true }).forEach(visit);
      return;
    }
    [...(element.shadowRoot?.children ?? element.children)].forEach(visit);
  };
  [...root.children].forEach(visit);
  return controls;
}

export function containFocus(event: KeyboardEvent, root: ShadowRoot): void {
  if (event.key !== "Tab" || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  const controls = focusableControls(root);
  const first = controls[0];
  const last = controls.at(-1);
  const boundary = event.shiftKey ? first : last;
  if (event.composedPath()[0] !== boundary) {
    return;
  }
  const destination = event.shiftKey ? last : first;
  event.preventDefault();
  destination?.focus();
}
