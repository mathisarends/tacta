import type { Annotation } from "./annotation-types.js";

export function paintAnnotations(
  context: CanvasRenderingContext2D,
  annotations: readonly Annotation[],
): void {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (const annotation of annotations) {
    context.save();
    context.fillStyle = annotation.color;
    context.strokeStyle = annotation.color;
    if (annotation.type === "text") {
      context.font = `${annotation.size}px sans-serif`;
      context.textBaseline = "top";
      annotation.text.split("\n").forEach((line, index) => {
        context.fillText(
          line,
          annotation.point.x,
          annotation.point.y + index * annotation.size * 1.2,
        );
      });
    } else {
      context.globalCompositeOperation =
        annotation.type === "erase" ? "destination-out" : "source-over";
      context.lineWidth = annotation.size;
      context.lineCap = "round";
      context.lineJoin = "round";
      const first = annotation.points[0];
      if (first) {
        context.beginPath();
        context.moveTo(first.x, first.y);
        for (const point of annotation.points.slice(1)) {
          context.lineTo(point.x, point.y);
        }
        if (annotation.points.length === 1) {
          context.arc(first.x, first.y, annotation.size / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.stroke();
        }
      }
    }
    context.restore();
  }
}

export function annotatedFilename(name: string): string {
  return `${
    name
      .split("/")
      .at(-1)
      ?.replace(/\.[^.]+$/, "") || "image"
  }-annotated.png`;
}
