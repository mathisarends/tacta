/** Explorer drag updates are transient until resizing becomes false. */
export interface ExplorerResizeDetail {
  width: number;
  resizing: boolean;
  collapse: boolean;
}

export type ExplorerResizeEvent = CustomEvent<ExplorerResizeDetail>;
export type PanelResizeEvent = CustomEvent<number>;
export type PanelResizeEndEvent = CustomEvent<void>;
