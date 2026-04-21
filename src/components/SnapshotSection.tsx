import { useEffect, useState } from "react";
import {
  listSnapshotsForOrigin,
  saveSnapshot,
  deleteSnapshot,
  getSnapshot,
  type Snapshot,
  type SnapshotField,
} from "../storage/snapshots";

interface SnapshotSectionProps {
  /** status mesajı yayar (modal dışı feedback için) */
  onStatus: (msg: string) => void;
}

/**
 * Aktif sekmede page context'te çalışır. Form alanlarını (input/textarea/select)
 * `#id` veya `[name="..."]` selector'ı ile beraber yakalar.
 */
function scanFormFields(): SnapshotField[] {
  const out: SnapshotField[] = [];
  const elements = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");
  elements.forEach((el) => {
    if (el instanceof HTMLInputElement) {
      if (["password", "hidden", "file", "submit", "button"].includes(el.type)) return;
      if (el.type === "checkbox" || el.type === "radio") {
        if (!el.id && !el.name) return;
        const sel = el.id
          ? `#${CSS.escape(el.id)}`
          : `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"][value="${CSS.escape(el.value)}"]`;
        out.push({ selector: sel, value: el.checked ? "1" : "0" });
        return;
      }
    }
    if (!el.id && !el.name) return;
    const selector = el.id
      ? `#${CSS.escape(el.id)}`
      : `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
    out.push({ selector, value: el.value });
  });
  return out;
}

/**
 * Aktif sekmede page context'te çalışır. Verilen selector→value map'ini uygular.
 */
function restoreFormFields(fields: SnapshotField[]): number {
  let applied = 0;
  const setValueReact = (
    el: HTMLInputElement | HTMLTextAreaElement,
    v: string,
  ) => {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  fields.forEach(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = value === "1";
        el.dispatchEvent(new Event("change", { bubbles: true }));
        applied += 1;
        return;
      }
      setValueReact(el, value);
      applied += 1;
      return;
    }
    if (el instanceof HTMLTextAreaElement) {
      setValueReact(el, value);
      applied += 1;
      return;
    }
    if (el instanceof HTMLSelectElement) {
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      applied += 1;
    }
  });
  return applied;
}

export function SnapshotSection({ onStatus }: SnapshotSectionProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [origin, setOrigin] = useState<string>("");
  const [pathname, setPathname] = useState<string>("");
  const [saveName, setSaveName] = useState<string>("");

  const refreshList = async (originValue: string, pathnameValue: string) => {
    const list = await listSnapshotsForOrigin(originValue, pathnameValue);
    setSnapshots(list);
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const url = tab?.url ?? "";
        if (!url) return;
        const u = new URL(url);
        if (cancelled) return;
        setOrigin(u.origin);
        setPathname(u.pathname);
        await refreshList(u.origin, u.pathname);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id || !tab.url) {
        onStatus("✕ Aktif sekme bulunamadı");
        return;
      }
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scanFormFields,
      });
      const fields = (result?.result as SnapshotField[] | undefined) ?? [];
      if (fields.length === 0) {
        onStatus("✕ Doldurulmuş alan bulunamadı");
        return;
      }
      const u = new URL(tab.url);
      await saveSnapshot({
        name: saveName.trim() || `Snapshot ${new Date().toLocaleTimeString()}`,
        origin: u.origin,
        pathname: u.pathname,
        createdAt: Date.now(),
        fields,
      });
      setSaveName("");
      await refreshList(u.origin, u.pathname);
      onStatus(`✓ ${fields.length} alan kaydedildi`);
    } catch (e) {
      onStatus(e instanceof Error ? `✕ ${e.message}` : "✕ Kaydetme hatası");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;
      const snap = await getSnapshot(id);
      if (!snap) return;
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: restoreFormFields,
        args: [snap.fields],
      });
      const applied = (result?.result as number | undefined) ?? 0;
      onStatus(`✓ ${applied}/${snap.fields.length} alan yüklendi`);
    } catch (e) {
      onStatus(e instanceof Error ? `✕ ${e.message}` : "✕ Yükleme hatası");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSnapshot(id);
    await refreshList(origin, pathname);
    onStatus("✓ Silindi");
  };

  return (
    <section className="settings-section">
      <h3>Form Snapshot</h3>
      <p>
        Aktif sekmenin form değerlerini kaydet, sonra aynı sayfada geri yükle.
        Origin: <code>{origin || "—"}</code>
      </p>
      <div className="settings-actions">
        <input
          type="text"
          className="settings-inline-input"
          placeholder="İsim (opsiyonel)"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
        />
        <button type="button" onClick={handleSave} disabled={!origin}>
          💾 Kaydet
        </button>
      </div>
      {snapshots.length > 0 && (
        <ul className="snapshot-list">
          {snapshots.map((s) => (
            <li key={s.id} className="snapshot-item">
              <div className="snapshot-meta">
                <div className="snapshot-name">{s.name}</div>
                <div className="snapshot-sub">
                  {s.fields.length} alan ·{" "}
                  {new Date(s.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="snapshot-actions">
                <button type="button" onClick={() => handleRestore(s.id)}>
                  📂
                </button>
                <button type="button" onClick={() => handleDelete(s.id)}>
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
