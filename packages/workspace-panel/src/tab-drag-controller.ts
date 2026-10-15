import type { ReactiveController, ReactiveControllerHost } from "lit";

type Options = {
  count: () => number;
  scroller: () => HTMLElement | null;
  onStart: () => void;
  onMove: (id: string, index: number) => void;
};

export class TabDragController implements ReactiveController {
  dragging: string | null = null;
  private dropIndex: number | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: Options,
  ) {
    host.addController(this);
  }

  hostDisconnected(): void {
    this.dragging = null;
    this.dropIndex = null;
  }

  start(event: DragEvent, id: string): void {
    if (!event.dataTransfer) {
      return;
    }
    this.dragging = id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    this.options.onStart();
    this.host.requestUpdate();
  }

  over(event: DragEvent, index: number): void {
    if (!this.dragging || !event.dataTransfer) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropIndex = index + (event.clientX > rect.left + rect.width / 2 ? 1 : 0);
    this.scrollToward(event.clientX);
    this.host.requestUpdate();
  }

  drop(event: DragEvent): void {
    if (!this.dragging || this.dropIndex === null) {
      return;
    }
    event.preventDefault();
    this.options.onMove(this.dragging, this.dropIndex);
    this.finish();
  }

  finish(): void {
    this.dragging = null;
    this.dropIndex = null;
    this.host.requestUpdate();
  }

  dropClass(index: number): string {
    if (this.dropIndex === index) {
      return "drop-before";
    }
    const count = this.options.count();
    if (this.dropIndex === count && index === count - 1) {
      return "drop-after";
    }
    return "";
  }

  private scrollToward(x: number): void {
    const scroller = this.options.scroller();
    if (!scroller) {
      return;
    }
    const bounds = scroller.getBoundingClientRect();
    if (x > bounds.right - 36) {
      scroller.scrollLeft += 16;
    } else if (x < bounds.left + 36) {
      scroller.scrollLeft -= 16;
    }
  }
}
