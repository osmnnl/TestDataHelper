import { useEffect, useRef, useState } from "react";
import {
  exportAll,
  importAll,
  getSettings,
  setSettings,
} from "../storage/favorites";
import { clearHistory } from "../storage/history";
import { decodePersona } from "../storage/share";
import { SnapshotSection } from "./SnapshotSection";
import "./SettingsModal.css";

const PERSONA_KEY = "currentPersona";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onChange?: () => void;
}

export function SettingsModal({ open, onClose, onChange }: SettingsModalProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [blocked, setBlocked] = useState("");
  const [personaCode, setPersonaCode] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void getSettings().then((s) => {
      if (!cancelled) setBlocked((s.blockedDomains ?? []).join("\n"));
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const importPersonaCode = async () => {
    try {
      const persona = decodePersona(personaCode);
      await chrome.storage.session.set({ [PERSONA_KEY]: persona });
      setPersonaCode("");
      setStatus("✓ Persona yüklendi. Persona sekmesini yeniden aç.");
      onChange?.();
    } catch (e) {
      setStatus(e instanceof Error ? `✕ ${e.message}` : "✕ Geçersiz kod");
    }
  };

  const saveBlocked = async () => {
    const list = blocked
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    await setSettings({ blockedDomains: list });
    setStatus(`✓ ${list.length} domain kaydedildi`);
  };

  const handleExport = async () => {
    try {
      const json = await exportAll();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-helper-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("✓ Dışa aktarıldı");
    } catch {
      setStatus("✕ Dışa aktarma başarısız");
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      await importAll(text);
      setStatus("✓ İçe aktarıldı. Popup'ı yeniden aç.");
      onChange?.();
    } catch {
      setStatus("✕ Geçersiz yedek dosyası");
    }
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setStatus("✓ Geçmiş temizlendi");
  };

  return (
    <div
      className="settings-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="settings-modal" role="dialog" aria-label="Ayarlar">
        <div className="settings-header">
          <h2>Ayarlar</h2>
          <button
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <section className="settings-section">
          <h3>Yedekleme</h3>
          <p>Favoriler ve ayarlarınızı JSON olarak dışa/içe aktarın.</p>
          <div className="settings-actions">
            <button type="button" onClick={handleExport}>
              ⬇ Dışa Aktar
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}>
              ⬆ İçe Aktar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
        </section>

        <section className="settings-section">
          <h3>Persona Kodu</h3>
          <p>
            Bir başkasından aldığın <code>dhp:v1:…</code> kodunu yapıştır;
            aynı persona'yı yükler.
          </p>
          <div className="settings-actions">
            <input
              type="text"
              className="settings-inline-input"
              placeholder="dhp:v1:..."
              value={personaCode}
              onChange={(e) => setPersonaCode(e.target.value)}
              spellCheck={false}
            />
            <button
              type="button"
              onClick={importPersonaCode}
              disabled={!personaCode.trim()}
            >
              ⬆ Yükle
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>Gizli Siteler</h3>
          <p>
            Bu domain'lerde Data Helper sağ-tık menüsü yoksayılır. Her satırda
            bir pattern: <code>banka.com.tr</code> veya{" "}
            <code>*.sirket.com</code>.
          </p>
          <textarea
            className="settings-textarea"
            rows={3}
            value={blocked}
            onChange={(e) => setBlocked(e.target.value)}
            placeholder="banka.com.tr&#10;*.sirket.com"
            spellCheck={false}
          />
          <div className="settings-actions">
            <button type="button" onClick={saveBlocked}>
              💾 Kaydet
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>Geçmiş</h3>
          <p>Oturum geçmişini şimdi temizle (tarayıcıyı kapatınca da silinir).</p>
          <div className="settings-actions">
            <button type="button" onClick={handleClearHistory}>
              🗑 Geçmişi Temizle
            </button>
          </div>
        </section>

        <SnapshotSection onStatus={setStatus} />

        {status && <div className="settings-status">{status}</div>}
      </div>
    </div>
  );
}
