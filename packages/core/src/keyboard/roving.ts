export type RovingAxis = "horizontal" | "vertical";

const steps: Record<RovingAxis, Record<string, number>> = {
  horizontal: { ArrowLeft: -1, ArrowRight: 1 },
  vertical: { ArrowUp: -1, ArrowDown: 1 },
};

export function isRovingKey(key: string, axis: RovingAxis): boolean {
  return key === "Home" || key === "End" || key in steps[axis];
}

export function rovingIndex(
  key: string,
  current: number,
  length: number,
  axis: RovingAxis,
): number {
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return length - 1;
  }
  if (length <= 0) {
    return 0;
  }
  return (current + (steps[axis][key] ?? 0) + length) % length;
}
