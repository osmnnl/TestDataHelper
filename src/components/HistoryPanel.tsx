import { useEffect, useState } from "react";
import {
  getHistory,
  clearHistory,
  type HistoryEntry,
} from "../storage/history";
import { Icon } from "../app/Icon";

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

  if (loading) return null;

  return (
    <section className="gen" aria-label="Son kopyalananlar">
      <div className="gen-row">
        <span className="section-label">Son kopyalananlar</span>
        {entries.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={async () => {
              await clearHistory();
              setEntries([]);
            }}
          >
            Temizle
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <span className="hint">Kopyaladığın değerler burada birikir; tarayıcı kapanınca silinir.</span>
      ) : (
        <ul className="rows rows--flush">
          {entries.map((entry, idx) => (
            <li key={`${entry.ts}-${idx}`} className="row">
              <button type="button" className="row-main" title="Tıkla, kopyala" onClick={() => onCopy(entry.value)}>
                <span className="row-label">
                  {entry.label}
                  <span className="row-tab">{formatTime(entry.ts)}</span>
                </span>
                <span className="row-value">{entry.value}</span>
              </button>
              <button type="button" className="icon-btn copy-btn" aria-label={`${entry.label} kopyala`} onClick={() => onCopy(entry.value)}>
                <Icon name="copy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
