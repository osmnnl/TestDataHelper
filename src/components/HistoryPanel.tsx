import { useEffect, useState } from "react";
import {
  getHistory,
  clearHistory,
  type HistoryEntry,
} from "../storage/history";
import "./HistoryPanel.css";

interface HistoryPanelProps {
  onCopy: (value: string) => void;
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function HistoryPanel({ onCopy }: HistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getHistory().then((list) => {
      if (!cancelled) {
        setEntries(list);
        setLoading(false);
      }
    });
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === "session" && changes.generationHistory) {
        setEntries(
          (changes.generationHistory.newValue as HistoryEntry[]) ?? [],
        );
      }
    };
    try {
      chrome.storage.onChanged.addListener(listener);
    } catch {
      /* dev ortamında API yok */
    }
    return () => {
      cancelled = true;
      try {
        chrome.storage.onChanged.removeListener(listener);
      } catch {
        /* noop */
      }
    };
  }, []);

  if (loading) {
    return <div className="history-empty">Yükleniyor…</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="history-empty">
        <span className="history-empty-icon">📜</span>
        <p>Henüz geçmiş yok</p>
        <span className="history-empty-hint">
          Sağ-tık menüsünden veya popup'tan veri ürettikçe burada birikir.
          Tarayıcıyı kapatınca silinir.
        </span>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <span>Son {entries.length} üretim</span>
        <button
          type="button"
          onClick={async () => {
            await clearHistory();
            setEntries([]);
          }}
        >
          Temizle
        </button>
      </div>
      {entries.map((entry, idx) => (
        <button
          key={`${entry.ts}-${idx}`}
          type="button"
          className="history-row"
          onClick={() => onCopy(entry.value)}
          title="Tıklayıp kopyala"
        >
          <span className="history-label">{entry.label}</span>
          <span className="history-value">{entry.value}</span>
          <span className="history-ts">{formatTime(entry.ts)}</span>
        </button>
      ))}
    </div>
  );
}
