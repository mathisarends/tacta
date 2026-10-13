export function positionMenu(menu: HTMLElement, trigger: HTMLElement): void {
  const rect = trigger.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - 16;
  const above = rect.top - 16;
  const placeBelow = below >= menu.scrollHeight || below >= above;
  menu.style.maxHeight = `${Math.max(80, placeBelow ? below : above)}px`;
  menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${placeBelow ? rect.bottom + 6 : Math.max(8, rect.top - menu.offsetHeight - 6)}px`;
}
