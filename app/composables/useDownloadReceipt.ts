import type { ProductReleaseArtifact } from "~/types/release";

export interface DownloadReceipt {
  artifact: ProductReleaseArtifact | null;
  url: string;
  productTitle?: string;
  version?: string | null;
  /** When the download was handed off, stamped onto the waybill in the dialog. */
  at?: string;
}

/**
 * Shared state behind the download receipt, so every download button on the site feeds
 * the single dialog mounted in the layout.
 */
export function useDownloadReceipt() {
  const open = useState("download-receipt-open", () => false);
  const receipt = useState<DownloadReceipt | null>("download-receipt", () => null);

  function downloaded(receiptData: DownloadReceipt) {
    receipt.value = { ...receiptData, at: new Date().toISOString() };
    open.value = true;
  }

  return { open, receipt, downloaded };
}
