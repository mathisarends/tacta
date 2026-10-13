export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 ** 2) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
