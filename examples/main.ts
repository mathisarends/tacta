import "@tacta/core/tokens.css";
import "@tacta/workspace/register";
import type { ExplorerResizeEvent, PanelResizeEvent } from "@tacta/workspace";

const panelSplitter = document.querySelector("tacta-panel-splitter")!;
const panel = document.querySelector<HTMLElement>(".panel")!;
const panelOutput = document.querySelector<HTMLOutputElement>("#panel-width")!;
panelSplitter.addEventListener("panel-resize", (event) => {
  const width = (event as PanelResizeEvent).detail;
  panelSplitter.value = width;
  panel.style.width = `${width}px`;
  panelOutput.value = `${width} px`;
});

const explorerSplitter = document.querySelector("tacta-explorer-splitter")!;
const explorer = document.querySelector<HTMLElement>(".explorer")!;
const explorerStage = document.querySelector<HTMLElement>(".explorer-stage")!;
const explorerOutput = document.querySelector<HTMLOutputElement>("#explorer-width")!;
const restore = document.querySelector<HTMLButtonElement>("#restore")!;
explorerSplitter.addEventListener("explorer-resize", (event) => {
  const { width, resizing, collapse } = (event as ExplorerResizeEvent).detail;
  explorerSplitter.value = width;
  explorerSplitter.toggleAttribute("resizing", resizing);
  explorerStage.classList.toggle("resizing", resizing);
  explorer.style.width = `${width}px`;
  if (collapse) {
    explorer.hidden = true;
    explorerSplitter.hidden = true;
    restore.hidden = false;
    restore.focus();
    explorerOutput.value = "Collapsed";
    return;
  }
  explorerOutput.value = `${Math.round(width)} px`;
});
restore.addEventListener("click", () => {
  explorer.hidden = false;
  explorerSplitter.hidden = false;
  restore.hidden = true;
  explorerOutput.value = `${explorerSplitter.value} px`;
  explorerSplitter.shadowRoot?.querySelector<HTMLElement>('[role="separator"]')?.focus();
});
