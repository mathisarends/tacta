export interface BrowserPage {
  url: string;
  title: string;
  favicon: string;
}

export type BrowserViewMode = "responsive" | "fit";

export type BrowserVideoMode = "auto" | "rpc";

export interface BrowserTab extends BrowserPage {
  id: string;
  initialUrl: string;
}
