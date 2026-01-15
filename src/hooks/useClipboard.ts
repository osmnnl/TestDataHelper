import { useState, useCallback } from "react";

/**
 * Panoya kopyalama hook'u
 * navigator.clipboard.writeText kullanır (MV3'te izin gerektirmez)
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // 1.5 saniye sonra sıfırla
      setTimeout(() => setCopied(false), 1500);

      return true;
    } catch (error) {
      console.error("Clipboard copy failed:", error);
      return false;
    }
  }, []);

  return { copy, copied };
}
