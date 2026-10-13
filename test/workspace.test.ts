import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  clampPanelWidth,
  type ExplorerResizeDetail,
  type TactaExplorerSplitter,
  type TactaPanelSplitter,
} from "../packages/workspace/src/index.js";
import "../packages/workspace/src/register.js";

afterEach(() => document.body.replaceChildren());

async function mount<T extends TactaPanelSplitter | TactaExplorerSplitter>(tag: string) {
  const outer = document.createElement("div");
  const stage = document.createElement("div");
  stage.style.cssText = "display:flex;width:1000px;height:400px";
  const element = document.createElement(tag) as T;
  const panel = document.createElement("div");
  panel.style.cssText = "width:260px;flex:0 0 260px";
  stage.append(element, panel);
  outer.append(stage);
  document.body.append(outer);
  await element.updateComplete;
  const handle = element.shadowRoot!.querySelector<HTMLElement>('[role="separator"]')!;
  return { outer, stage, element, panel, handle };
}

function pointer(handle: HTMLElement, type: string, clientX = 740, pointerId = 1, button = 0) {
  handle.dispatchEvent(new PointerEvent(type, { clientX, pointerId, button, cancelable: true }));
}

function capture(handle: HTMLElement) {
  vi.spyOn(handle, "setPointerCapture").mockImplementation(() => {});
  vi.spyOn(handle, "hasPointerCapture").mockReturnValue(true);
  return vi.spyOn(handle, "releasePointerCapture").mockImplementation(() => {});
}

it.each([
  [100, 1000, 480, 280],
  [900, 1000, 480, 520],
  [400, 1000, 480, 400],
  [500, 300, 480, 280],
])("bounds panel width %i in stage %i", (width, stage, reserve, expected) => {
  expect(clampPanelWidth(width, stage, reserve)).toBe(expected);
});

it("supports actual keyboard focus, arrow keys, Home and End across shadow DOM", async () => {
  const { element, handle, outer } = await mount<TactaPanelSplitter>("tacta-panel-splitter");
  element.value = 400;
  await element.updateComplete;
  const widths: number[] = [];
  const ended = vi.fn();
  outer.addEventListener("panel-resize", (event) => {
    const width = (event as CustomEvent<number>).detail;
    widths.push(width);
    element.value = width;
  });
  outer.addEventListener("panel-resize-end", ended);
  await userEvent.tab();
  expect(element.shadowRoot!.activeElement).toBe(handle);
  await userEvent.keyboard("{ArrowLeft}{ArrowRight}{Home}{End}{Enter}");
  await element.updateComplete;
  expect(widths).toEqual([424, 400, 280, 520]);
  expect(ended).toHaveBeenCalledTimes(4);
  expect(handle.getAttribute("aria-valuenow")).toBe("520");
  expect(handle.getAttribute("aria-valuemax")).toBe("520");
  expect(handle.getAttribute("aria-label")).toBe("Resize panel");
});

it.each(["pointerup", "pointercancel", "lostpointercapture", "disconnect"])(
  "ends panel drag and cleans up on %s",
  async (end) => {
    const { element, handle } = await mount<TactaPanelSplitter>("tacta-panel-splitter");
    const released = capture(handle);
    const widths = vi.fn();
    const ended = vi.fn();
    element.addEventListener("panel-resize", widths);
    element.addEventListener("panel-resize-end", ended);
    pointer(handle, "pointerdown", 740, 1, 2);
    expect(ended).not.toHaveBeenCalled();
    pointer(handle, "pointerdown");
    pointer(handle, "pointermove", 100, 2);
    expect(widths).not.toHaveBeenCalled();
    pointer(handle, "pointermove", 100);
    pointer(handle, "pointermove", 9999);
    expect(widths.mock.calls.map(([event]) => event.detail)).toEqual([520, 280]);
    if (end === "disconnect") {
      element.remove();
    } else {
      pointer(handle, end);
    }
    expect(released).toHaveBeenCalledExactlyOnceWith(1);
    expect(ended).toHaveBeenCalledOnce();
    pointer(handle, "pointermove", 500);
    expect(widths).toHaveBeenCalledTimes(2);
  },
);

it("publishes accurate ARIA bounds when the parent resizes", async () => {
  const { stage, handle } = await mount<TactaPanelSplitter>("tacta-panel-splitter");
  expect(handle.getAttribute("aria-valuemax")).toBe("520");
  stage.style.width = "800px";
  await expect.poll(() => handle.getAttribute("aria-valuemax")).toBe("320");
  stage.style.width = "200px";
  await expect.poll(() => handle.getAttribute("aria-valuemax")).toBe("280");
  expect(Number(handle.getAttribute("aria-valuenow"))).toBe(280);
});

it("supports configurable bounds, step, label and hidden state", async () => {
  const { element, handle } = await mount<TactaPanelSplitter>("tacta-panel-splitter");
  element.setAttribute("min-width", "100");
  element.setAttribute("reserve", "200");
  element.setAttribute("step", "10");
  element.setAttribute("value", "300");
  element.setAttribute("label", "Resize tools");
  await element.updateComplete;
  const resize = vi.fn();
  element.addEventListener("panel-resize", resize);
  handle.focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(resize.mock.calls[0]![0].detail).toBe(310);
  expect(handle.getAttribute("aria-valuemin")).toBe("100");
  expect(handle.getAttribute("aria-valuemax")).toBe("800");
  expect(handle.getAttribute("aria-label")).toBe("Resize tools");
  element.hidden = true;
  expect(element.checkVisibility()).toBe(false);
});

async function explorer() {
  const result = await mount<TactaExplorerSplitter>("tacta-explorer-splitter");
  const changes: ExplorerResizeDetail[] = [];
  result.element.addEventListener("explorer-resize", (event) => {
    changes.push((event as CustomEvent<ExplorerResizeDetail>).detail);
  });
  capture(result.handle);
  return { ...result, changes };
}

it("emits transient explorer widths and commits a bounded width", async () => {
  const { handle, changes, outer } = await explorer();
  const bubbled = vi.fn();
  outer.addEventListener("explorer-resize", bubbled);
  pointer(handle, "pointerdown");
  expect(changes.at(-1)).toEqual({ width: 260, resizing: true, collapse: false });
  pointer(handle, "pointermove", 0, 2);
  expect(changes).toHaveLength(1);
  pointer(handle, "pointermove", 0);
  expect(changes.at(-1)?.width).toBe(497);
  pointer(handle, "pointermove", 850);
  pointer(handle, "pointerup");
  expect(changes.at(-1)).toEqual({ width: 185, resizing: false, collapse: false });
  expect(bubbled).toHaveBeenCalledTimes(4);
  expect(bubbled.mock.calls[0]![0].composed).toBe(true);
});

it("requests collapse without losing the previous saved width", async () => {
  const { element, handle, changes } = await explorer();
  element.value = 300;
  pointer(handle, "pointerdown");
  pointer(handle, "pointermove", 1000);
  pointer(handle, "pointerup");
  expect(changes.at(-1)).toEqual({ width: 300, resizing: false, collapse: true });
});

it.each(["pointercancel", "lostpointercapture", "disconnect"])(
  "restores explorer width and removes drag listeners on %s",
  async (end) => {
    const { element, handle, changes } = await explorer();
    pointer(handle, "pointerdown");
    pointer(handle, "pointermove", 700);
    if (end === "disconnect") {
      element.remove();
    } else {
      pointer(handle, end);
    }
    expect(changes.at(-1)).toEqual({ width: 260, resizing: false, collapse: false });
    const count = changes.length;
    pointer(handle, "pointermove", 600);
    expect(changes).toHaveLength(count);
  },
);

it("supports explorer keyboard resizing and double-click reset", async () => {
  const { element, handle, panel, changes } = await explorer();
  element.addEventListener("explorer-resize", (event) => {
    const { width } = (event as CustomEvent<ExplorerResizeDetail>).detail;
    element.value = width;
    panel.style.flexBasis = `${width}px`;
  });
  handle.focus();
  await userEvent.keyboard("{ArrowLeft}{ArrowRight}{Home}{End}{Enter}");
  expect(changes.map(({ width }) => width)).toEqual([284, 260, 185, 497]);
  await element.updateComplete;
  expect(handle.getAttribute("aria-valuenow")).toBe("497");
  handle.dispatchEvent(new MouseEvent("dblclick"));
  expect(changes.at(-1)?.width).toBe(497);
  pointer(handle, "pointerdown", 740, 1, 2);
  expect(changes).toHaveLength(5);
});

it("inherits theme tokens and allows part overrides without app styles", async () => {
  const { outer, element, handle } = await mount<TactaExplorerSplitter>("tacta-explorer-splitter");
  outer.style.setProperty("--tacta-color-border-strong", "rgb(10, 20, 30)");
  element.setAttribute("resizing", "");
  expect(getComputedStyle(handle).backgroundColor).toBe("rgb(10, 20, 30)");
  const style = document.createElement("style");
  style.textContent = "tacta-explorer-splitter::part(handle) { border-radius: 4px; }";
  outer.append(style);
  expect(getComputedStyle(handle).borderRadius).toBe("4px");
});
