function withScheme(value: string): string {
  const scheme = /^[a-z][a-z\d+.-]*:/i.test(value);
  const hostWithPort = /^[^/:\s]+:\d+(?:[/?#]|$)/.test(value);
  if (scheme && !hostWithPort) {
    return value;
  }
  return `https://${value}`;
}

export function parseBrowserAddress(address: string): URL | null {
  let url: URL;
  try {
    url = new URL(withScheme(address.trim()));
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol) || /[\s%]/.test(url.hostname)) {
    return null;
  }
  return url;
}

export function resolveBrowserAddress(address: string): URL | null {
  const value = address.trim();
  if (!value) {
    return null;
  }
  const url = parseBrowserAddress(value);
  const explicitScheme = /^[a-z][a-z\d+.-]*:/i.test(value);
  const hostWithPort = /^[^/:\s]+:\d+(?:[/?#]|$)/.test(value);
  if (explicitScheme && !hostWithPort) {
    return url;
  }
  if (
    url &&
    (url.hostname.includes(".") || url.hostname === "localhost" || url.hostname.startsWith("["))
  ) {
    return url;
  }
  const search = new URL("https://duckduckgo.com/");
  search.searchParams.set("q", value);
  return search;
}
