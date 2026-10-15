export type ToastKind = "info" | "success" | "warning" | "error";

export type ToastOptions = { description?: string; duration?: number };

export type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
  description?: string;
};

type Timer = { handle?: number; remaining: number; startedAt: number };

const defaultDuration: Record<ToastKind, number> = {
  info: 4000,
  success: 4000,
  warning: 6000,
  error: 8000,
};

export class ToastStore {
  items: readonly ToastItem[] = [];
  private nextId = 1;
  private readonly timers = new Map<number, Timer>();
  private readonly listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  add(kind: ToastKind, message: string, options: ToastOptions = {}): number {
    const id = this.nextId++;
    this.items = [...this.items, { id, kind, message, description: options.description }];
    const duration = options.duration ?? defaultDuration[kind];
    if (Number.isFinite(duration)) {
      this.timers.set(id, { remaining: duration, startedAt: 0 });
      this.start(id);
    }
    this.emit();
    return id;
  }

  dismiss(id?: number): void {
    const ids = id === undefined ? this.items.map((item) => item.id) : [id];
    ids.forEach((current) => this.stop(current, true));
    this.items = this.items.filter((item) => !ids.includes(item.id));
    this.emit();
  }

  pause(): void {
    this.timers.forEach((timer, id) => {
      if (timer.handle !== undefined) {
        timer.remaining -= Date.now() - timer.startedAt;
        this.stop(id);
      }
    });
  }

  resume(): void {
    this.timers.forEach((_, id) => this.start(id));
  }

  private start(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.handle !== undefined) {
      return;
    }
    timer.startedAt = Date.now();
    timer.handle = window.setTimeout(() => this.dismiss(id), Math.max(timer.remaining, 0));
  }

  private stop(id: number, forget = false): void {
    const timer = this.timers.get(id);
    if (!timer) {
      return;
    }
    window.clearTimeout(timer.handle);
    timer.handle = undefined;
    if (forget) {
      this.timers.delete(id);
    }
  }

  private emit(): void {
    this.listeners.forEach((notify) => notify());
  }
}

export const toastStore = new ToastStore();
