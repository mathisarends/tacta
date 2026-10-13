import { noChange } from "lit";
import { AsyncDirective } from "lit/async-directive.js";
import { directive, PartType, type ElementPart, type PartInfo } from "lit/directive.js";

export type TooltipPlacement = "bottom" | "right";

let nextId = 0;
let activeTooltip: TooltipDirective | undefined;

class TooltipDirective extends AsyncDirective {
  private trigger?: HTMLElement;
  private bubble?: HTMLDivElement;
  private root?: Node;
  private label = "";
  private placement: TooltipPlacement = "bottom";
  private timer?: ReturnType<typeof setTimeout>;
  private listeners?: AbortController;
  private hovered = false;
  private focused = false;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error("tooltip must be attached to an element");
    }
  }

  override render(label: string, placement?: TooltipPlacement): typeof noChange {
    return noChange;
  }

  override update(
    part: ElementPart,
    [label, placement = "bottom"]: [string, TooltipPlacement?],
  ): typeof noChange {
    this.label = label;
    this.placement = placement;
    if (!this.trigger) {
      this.trigger = part.element as HTMLElement;
      this.connect();
    }
    if (this.bubble) {
      this.bubble.textContent = label;
      this.position();
    }
    return noChange;
  }

  private connect(): void {
    this.listeners = new AbortController();
    const options = { signal: this.listeners.signal };
    this.trigger?.addEventListener(
      "pointerenter",
      (event) => {
        if (event.pointerType === "touch") {
          return;
        }
        this.hovered = true;
        this.schedule(400);
      },
      options,
    );
    this.trigger?.addEventListener(
      "pointerleave",
      () => {
        this.hovered = false;
        this.scheduleHide();
      },
      options,
    );
    this.trigger?.addEventListener(
      "focus",
      () => {
        this.focused = !!this.trigger?.matches(":focus-visible");
        if (this.focused) {
          this.schedule(0);
        }
      },
      options,
    );
    this.trigger?.addEventListener(
      "blur",
      () => {
        this.focused = false;
        this.scheduleHide();
      },
      options,
    );
    this.trigger?.addEventListener("pointerdown", this.hide, options);
    this.trigger?.addEventListener("click", this.hide, options);
  }

  private schedule(delay: number): void {
    clearTimeout(this.timer);
    if (!this.bubble) {
      this.timer = setTimeout(() => this.show(), delay);
    }
  }

  private scheduleHide(): void {
    clearTimeout(this.timer);
    if (!this.hovered && !this.focused) {
      // Allow the pointer to cross the gap and hover the tooltip itself.
      this.timer = setTimeout(this.hide, 120);
    }
  }

  private show(): void {
    if (!this.trigger?.isConnected || !this.label || this.trigger.matches(":disabled")) {
      return;
    }
    activeTooltip?.hide();
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- one tooltip is open at a time
    activeTooltip = this;
    const bubble = document.createElement("div");
    this.bubble = bubble;
    bubble.id = `tooltip-${++nextId}`;
    bubble.role = "tooltip";
    bubble.popover = "manual";
    bubble.textContent = this.label;
    bubble.style.cssText = `
      position: fixed; inset: auto; margin: 0; width: max-content;
      max-width: min(280px, calc(100vw - 16px)); box-sizing: border-box;
      padding: 7px 10px; border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-tooltip, 7px); background: var(--tacta-color-menu, var(--tacta-color-surface, #252627)); color: var(--tacta-color-text, #e6e6e6);
      box-shadow: var(--tacta-shadow-menu, 0 12px 36px #0004); font: var(--tacta-font-weight-regular, 400) var(--tacta-font-size-tooltip, var(--tacta-text-base, 0.875rem))/var(--tacta-line-height-control, 1.4) var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
      letter-spacing: normal; text-align: center; overflow-wrap: anywhere;
      white-space: normal; pointer-events: auto;
    `;
    bubble.addEventListener("pointerenter", () => {
      this.hovered = true;
      clearTimeout(this.timer);
    });
    bubble.addEventListener("pointerleave", () => {
      this.hovered = false;
      this.scheduleHide();
    });
    // Keep the description in the trigger's shadow root, and use the top layer
    // so scrolling containers and panel boundaries cannot clip it.
    const root = this.trigger.getRootNode();
    this.root = root;
    (root instanceof ShadowRoot ? root : document.body).appendChild(bubble);
    const describedBy = this.trigger.getAttribute("aria-describedby");
    this.trigger.setAttribute(
      "aria-describedby",
      [describedBy, bubble.id].filter(Boolean).join(" "),
    );
    bubble.showPopover();
    this.position();
    window.addEventListener("keydown", this.onKeyDown, true);
    window.addEventListener("scroll", this.hide, true);
    root.addEventListener("scroll", this.hide, true);
    window.addEventListener("resize", this.hide);
  }

  private position(): void {
    if (!this.trigger || !this.bubble) {
      return;
    }
    const rect = this.trigger.getBoundingClientRect();
    const { width, height } = this.bubble.getBoundingClientRect();
    if (this.placement === "right") {
      const right = rect.right + 8;
      const left = right + width <= window.innerWidth - 8 ? right : rect.left - width - 8;
      const top = rect.top + (rect.height - height) / 2;
      this.bubble.style.left = `${Math.max(8, left)}px`;
      this.bubble.style.top = `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`;
      return;
    }
    const below = rect.bottom + 8;
    this.bubble.style.left = `${Math.max(8, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - 8))}px`;
    this.bubble.style.top = `${Math.max(8, below + height <= window.innerHeight - 8 ? below : rect.top - height - 8)}px`;
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
    }
  };

  private readonly hide = (): void => {
    clearTimeout(this.timer);
    if (this.bubble) {
      const remaining = this.trigger
        ?.getAttribute("aria-describedby")
        ?.split(/\s+/)
        .filter((id) => id !== this.bubble?.id)
        .join(" ");
      if (remaining) {
        this.trigger?.setAttribute("aria-describedby", remaining);
      } else {
        this.trigger?.removeAttribute("aria-describedby");
      }
      this.bubble.remove();
      this.bubble = undefined;
    }
    if (activeTooltip === this) {
      activeTooltip = undefined;
    }
    window.removeEventListener("keydown", this.onKeyDown, true);
    window.removeEventListener("scroll", this.hide, true);
    this.root?.removeEventListener("scroll", this.hide, true);
    this.root = undefined;
    window.removeEventListener("resize", this.hide);
  };

  protected override disconnected(): void {
    this.hide();
    this.listeners?.abort();
    this.hovered = false;
    this.focused = false;
  }

  protected override reconnected(): void {
    this.connect();
  }
}

export const tooltip = directive(TooltipDirective);
