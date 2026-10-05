const PLATFORM_LABELS: Record<string, string> = {
  macos: "macOS",
  darwin: "macOS",
  windows: "Windows",
  win32: "Windows",
  linux: "Linux",
  android: "Android",
  ios: "iOS",
  web: "Web",
};

/** Human label for a Distribution platform id, or null when the artifact names none. */
export function artifactPlatformLabel(platform?: string | null): string | null {
  if (!platform) return null;
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

export function formatArtifactSize(size?: number | null): string | null {
  if (size == null || !Number.isFinite(size) || size < 0) return null;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 || value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Waybill number for an artifact: the first eight characters of its recorded digest,
 * which is what the barcode on the download dialog encodes.
 */
export function shipmentNumber(hash?: string | null): string | null {
  if (!hash) return null;
  const digest = hash.slice(hash.lastIndexOf(":") + 1).replace(/[^0-9a-z]/gi, "");
  return digest.length >= 8 ? digest.slice(0, 8).toUpperCase() : null;
}

/**
 * Starts a download without leaving the page: artifact URLs redirect to storage that
 * serves an installer MIME type and no Content-Disposition, so a same-tab anchor click
 * downloads the file while the document stays put. Called synchronously from the click
 * handler so the browser still sees the user gesture.
 */
export function startDownload(url: string): void {
  if (import.meta.server) return;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
