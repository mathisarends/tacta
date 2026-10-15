export type SidebarItem = {
  id: string;
  title: string;
  href: string;
  titlePending?: boolean;
  replying?: boolean;
  pinned: boolean;
  unread: boolean;
};

export type SidebarRenameDetail = { id: string; title: string };
