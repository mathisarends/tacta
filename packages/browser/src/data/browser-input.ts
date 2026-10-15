type MouseButton = "none" | "left" | "middle" | "right" | "back" | "forward";
type ModifierKeys = Pick<MouseEvent, "altKey" | "ctrlKey" | "metaKey" | "shiftKey">;
type PointerPosition = Pick<MouseEvent, "clientX" | "clientY">;
type MouseLike = ModifierKeys & Pick<MouseEvent, "button" | "buttons" | "detail">;
type WheelLike = ModifierKeys & Pick<WheelEvent, "deltaX" | "deltaY" | "deltaMode">;
type KeyLike = ModifierKeys &
  Pick<KeyboardEvent, "type" | "key" | "code" | "repeat" | "keyCode" | "location">;
type ShortcutLike = ModifierKeys & Pick<KeyboardEvent, "key" | "getModifierState">;
type Bounds = Pick<DOMRect, "left" | "top" | "width" | "height">;

export type PageSize = { width: number; height: number };
export type PagePoint = { x: number; y: number };
export type MouseInput = {
  type: "mouseDown" | "mouseMove" | "mouseUp";
  x: number;
  y: number;
  button?: MouseButton;
  buttons?: number;
  modifiers?: number;
  clickCount?: number;
};
export type ScrollInput = {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  modifiers?: number;
};
export type KeyInput = {
  type: "keyDown" | "keyUp" | "rawKeyDown" | "char";
  key: string;
  code: string;
  text?: string;
  unmodifiedText?: string;
  modifiers?: number;
  autoRepeat?: boolean;
  windowsVirtualKeyCode?: number;
  nativeVirtualKeyCode?: number;
  location?: number;
  isKeypad?: boolean;
  isSystemKey?: boolean;
};
export type ClipboardAction = "copy" | "paste";

const buttons: MouseButton[] = ["left", "middle", "right", "back", "forward"];
const heldButtons: [number, MouseButton][] = [
  [1, "left"],
  [2, "right"],
  [4, "middle"],
  [8, "back"],
  [16, "forward"],
];
const deltaLine = 1;
const deltaPage = 2;
const lineHeight = 16;
const maxScroll = 10000;
const numpadLocation = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function heldButton(pressed: number): MouseButton {
  return heldButtons.find(([bit]) => pressed & bit)?.[1] ?? "none";
}

function wheelScale(deltaMode: number, pageHeight: number): number {
  if (deltaMode === deltaLine) {
    return lineHeight;
  }
  if (deltaMode === deltaPage) {
    return pageHeight;
  }
  return 1;
}

function keyType(event: Pick<KeyboardEvent, "type" | "key">): KeyInput["type"] {
  if (event.type === "keyup") {
    return "keyUp";
  }
  if (event.key === "Enter") {
    return "keyDown";
  }
  return "rawKeyDown";
}

export function modifiers(event: ModifierKeys): number {
  return (
    Number(event.altKey) +
    Number(event.ctrlKey) * 2 +
    Number(event.metaKey) * 4 +
    Number(event.shiftKey) * 8
  );
}

export function pictureBounds(element: Bounds, picture: PageSize): Bounds {
  if (picture.width <= 0 || picture.height <= 0) {
    return element;
  }
  const scale = Math.min(element.width / picture.width, element.height / picture.height);
  const width = picture.width * scale;
  const height = picture.height * scale;
  return {
    left: element.left + (element.width - width) / 2,
    top: element.top + (element.height - height) / 2,
    width,
    height,
  };
}

export function pagePoint(event: PointerPosition, bounds: Bounds, page: PageSize): PagePoint {
  return {
    x: clamp(((event.clientX - bounds.left) * page.width) / bounds.width, 0, page.width - 1),
    y: clamp(((event.clientY - bounds.top) * page.height) / bounds.height, 0, page.height - 1),
  };
}

export function mouseInput(
  type: MouseInput["type"],
  event: MouseLike,
  point: PagePoint,
): MouseInput {
  if (type === "mouseMove") {
    return {
      type,
      ...point,
      button: heldButton(event.buttons),
      buttons: event.buttons,
      modifiers: modifiers(event),
    };
  }
  return {
    type,
    ...point,
    button: buttons[event.button] ?? "none",
    buttons: event.buttons,
    modifiers: modifiers(event),
    clickCount: clamp(event.detail, 1, 3),
  };
}

export function scrollInput(event: WheelLike, point: PagePoint, pageHeight: number): ScrollInput {
  const scale = wheelScale(event.deltaMode, pageHeight);
  return {
    ...point,
    deltaX: clamp(event.deltaX * scale, -maxScroll, maxScroll),
    deltaY: clamp(event.deltaY * scale, -maxScroll, maxScroll),
    modifiers: modifiers(event),
  };
}

export function keyInput(event: KeyLike): KeyInput {
  return {
    type: keyType(event),
    key: event.key,
    code: event.code,
    modifiers: modifiers(event),
    autoRepeat: event.repeat,
    text: event.type === "keydown" && event.key === "Enter" ? "\r" : undefined,
    windowsVirtualKeyCode: event.keyCode,
    location: Math.min(2, event.location),
    isKeypad: event.location === numpadLocation,
  };
}

export function clipboardAction(event: ShortcutLike): ClipboardAction | null {
  if (!event.ctrlKey && !event.metaKey) {
    return null;
  }
  const key = event.key.toLowerCase();
  if (key === "c") {
    return "copy";
  }
  if (key === "v") {
    return "paste";
  }
  return null;
}

export function isCommandKey(event: ShortcutLike): boolean {
  if (event.key.length !== 1) {
    return true;
  }
  if (event.getModifierState("AltGraph")) {
    return false;
  }
  return event.ctrlKey || event.metaKey || event.altKey;
}
