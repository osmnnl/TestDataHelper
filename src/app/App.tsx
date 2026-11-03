import { useCallback, useEffect, useMemo, useState } from "react";
import { CATALOG, type TabId } from "../shared/catalog";
import type { HelperState, RunRequest } from "../background/service-worker";
import type { RunMode, RunResult } from "../content/engine";
import { TextGenerator } from "../components/TextGenerator";
import { HistoryPanel } from "../components/HistoryPanel";
import { SettingsModal } from "../components/SettingsModal";
import { useFavorites } from "../hooks/useFavorites";
import { appendHistory } from "../storage/history";
import { BulkPanel } from "./BulkPanel";
import { Icon } from "./Icon";
import "./App.css";

type PopupTab = "person" | "company" | "finance" | "address" | "text" | "bulk";

const POPUP_TABS: ReadonlyArray<{ id: PopupTab; label: string; from: TabId[] }> = [
  { id: "person", label: "Kişi", from: ["person", "date"] },
  { id: "company", label: "Şirket", from: ["company"] },
  { id: "finance", label: "Finans", from: ["finance"] },
  { id: "address", label: "Adres", from: ["address"] },
  { id: "text", label: "Metin", from: [] },
  { id: "bulk", label: "Toplu", from: [] },
];

const IS_MAC = navigator.userAgent.includes("Mac");
const FORM_KEY = IS_MAC ? "⌘⇧F" : "Ctrl+Shift+F";

type LastFill = (RunResult & { ts: number }) | null;

function send<T>(msg: unknown): Promise<T> {
  return chrome.runtime.sendMessage(msg) as Promise<T>;
}

function displayDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function App({ variant }: { variant: "popup" | "panel" }) {
  const [state, setState] = useState<HelperState | null>(null);
  const [tab, setTab] = useState<PopupTab>("person");
  const [tabId, setTabId] = useState<number | null>(null);
  const [windowId, setWindowId] = useState<number | null>(null);
  const [lastFill, setLastFill] = useState<LastFill>(null);
  const [status, setStatus] = useState<string>("");
  const [needsPermission, setNeedsPermission] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const refreshTab = useCallback(async () => {
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!t?.id) return;
    setTabId(t.id);
    setWindowId(t.windowId);
    setLastFill(await send<LastFill>({ type: "dh:getLastFill", tabId: t.id }));
  }, []);

  useEffect(() => {
    void send<HelperState>({ type: "dh:state" }).then(setState);
    void Promise.resolve().then(refreshTab);
    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && (changes["dh.persona"] || changes["dh.company"] || changes["dh.locked"])) {
        void send<HelperState>({ type: "dh:state" }).then(setState);
      }
      if (area === "session") void refreshTab();
    };
    chrome.storage.onChanged.addListener(onChanged);
    // Yan panelde sekme değişince hedef sekmeyi güncelle
    const onActivated = () => void refreshTab();
    chrome.tabs.onActivated.addListener(onActivated);
    return () => {
      chrome.storage.onChanged.removeListener(onChanged);
      chrome.tabs.onActivated.removeListener(onActivated);
    };
  }, [refreshTab]);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const run = async (mode: RunMode) => {
    if (!tabId) return;
    setBusy(true);
    const req: RunRequest = { tabId, mode };
    const res = await send<RunResult | { error: string }>({ type: "dh:run", req });
    setBusy(false);
    if ("error" in res) {
      if (/permission|Cannot access|izin/i.test(res.error)) {
        const t = await chrome.tabs.get(tabId);
        const origin = t.url ? new URL(t.url).origin : null;
        setNeedsPermission(origin);
        flash("Bu sayfaya erişim izni gerekiyor");
      } else flash(res.error);
      return;
    }
    if (mode === "undo") flash(res.message ?? "Geri alındı");
    else if (res.message && !res.filled) flash(res.message);
    void refreshTab();
  };

  const preview = async () => {
    if (!tabId) return;
    void send({ type: "dh:run", req: { tabId, mode: "preview" } satisfies RunRequest });
    // Önizleme paneli sayfada açılır; popup kapanır ki sayfa kullanılabilsin
    if (variant === "popup") window.setTimeout(() => window.close(), 150);
  };

  const grant = async () => {
    if (!needsPermission) return;
    const ok = await chrome.permissions.request({ origins: [`${needsPermission}/*`] });
    setNeedsPermission(null);
    if (ok) void run("form");
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      flash(`${label} kopyalandı`);
      void appendHistory({ label, value, ts: Date.now(), source: "popup" });
    } catch {
      flash("Kopyalanamadı");
    }
  };

  const regenerate = async (what: "persona" | "company") => {
    setState(await send<HelperState>({ type: "dh:regenerate", what }));
  };

  const toggleLock = async () => {
    if (!state) return;
    setState(await send<HelperState>({ type: "dh:lock", locked: !state.locked }));
  };

  const openPanel = () => {
    // Kullanıcı hareketi kaybolmasın diye await yok
    if (windowId !== null) void chrome.sidePanel.open({ windowId }).then(() => window.close());
  };

  const rows = useMemo(() => {
    if (!state) return [];
    const from = POPUP_TABS.find((t) => t.id === tab)?.from ?? [];
    const items = CATALOG.filter((c) => from.includes(c.tab));
    // Favoriler sekmenin başında
    return [...items.filter((i) => isFavorite(i.id)), ...items.filter((i) => !isFavorite(i.id))];
  }, [state, tab, isFavorite]);

  if (!state) return <div className={`app app--${variant}`} />;
  const p = state.persona;

  return (
    <div className={`app app--${variant}`}>
      <header className="top">
        <div className="brand">
          <span className="logo" aria-hidden="true">D</span>
          <span className="brand-name">Data Helper</span>
        </div>
        <div className="top-actions">
          {variant === "popup" && (
            <button className="icon-btn" aria-label="Yan paneli aç" title="Yan paneli aç" onClick={openPanel}>
              <Icon name="panel" />
            </button>
          )}
          <button className="icon-btn" aria-label="Ayarlar" title="Ayarlar" onClick={() => setSettingsOpen(true)}>
            <Icon name="settings" />
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="fill-row">
          <button className="btn-primary" onClick={() => void run("form")} disabled={busy || !tabId}>
            {busy ? "Dolduruluyor…" : "Bu formu doldur"} <kbd>{FORM_KEY}</kbd>
          </button>
          <button className="btn" onClick={() => void preview()} disabled={!tabId}>Önizle</button>
        </div>
        {needsPermission && (
          <div className="perm">
            <span>Yan panelden doldurmak için {needsPermission} için izin verin.</span>
            <button className="btn btn-sm" onClick={() => void grant()}>İzin ver</button>
          </div>
        )}
        <div className="persona">
          <div className="persona-head">
            <span className="persona-name">{p.fullName}</span>
            <span className="persona-actions">
              <button className="btn btn-sm" onClick={() => void regenerate("persona")} disabled={state.locked} title={state.locked ? "Kilitliyken yenilenmez" : "Yeni kişi"}>Yenile</button>
              <button className={`btn btn-sm${state.locked ? " is-on" : ""}`} aria-pressed={state.locked} onClick={() => void toggleLock()}>
                {state.locked ? "Kilitli" : "Kilitle"}
              </button>
            </span>
          </div>
          <div className="persona-meta">
            {p.gender === "female" ? "Kadın" : "Erkek"} · {p.birthDate} · {p.city} / {p.district} {p.postalCode} · {p.plateCode} plaka
            <br />
            Anne {p.motherName} · Baba {p.fatherName} · İşe giriş {displayDate(p.dates.hire)}
          </div>
        </div>
      </section>

      <nav className="tabs" role="tablist" aria-label="Veri grupları">
        {POPUP_TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab${tab === t.id ? " is-active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="body">
        {tab === "text" ? (
          <div className="pad">
            <TextGenerator onCopy={(v) => void copy("Metin", v)} />
            <HistoryPanel onCopy={(v) => void copy("Değer", v)} />
          </div>
        ) : tab === "bulk" ? (
          <BulkPanel company={state.company} onStatus={flash} />
        ) : (
          <>
            {tab === "company" && (
              <div className="subhead">
                <span>{state.company.name}</span>
                <button className="btn btn-sm" onClick={() => void regenerate("company")}>Yeni şirket</button>
              </div>
            )}
            <ul className="rows">
              {rows.map((item) => {
                const value = item.get(state);
                const shown = item.display?.(state) ?? value;
                const check = item.check?.(state);
                const fav = isFavorite(item.id);
                return (
                  <li key={item.id} className="row">
                    <div className="row-main">
                      <span className="row-label">{item.label}</span>
                      <span className="row-value" title={shown}>{shown}</span>
                    </div>
                    {check && <span className="row-check">{check}</span>}
                    <button className={`icon-btn icon-btn--sm${fav ? " is-fav" : ""}`} aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"} aria-pressed={fav} onClick={() => void toggleFavorite(item.id)}>
                      <Icon name="star" filled={fav} />
                    </button>
                    <button className="icon-btn icon-btn--box" aria-label={`${item.label} kopyala`} onClick={() => void copy(item.label, value)}>
                      <Icon name="copy" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>

      <footer className="foot">
        <span className="foot-text" role="status">
          {status ||
            (lastFill
              ? `Son doldurma: ${lastFill.filled} alan${lastFill.skipped ? ` · ${lastFill.skipped} atlandı` : ""}${lastFill.mismatches.length ? ` · ${lastFill.mismatches.length} tutmadı` : ""}`
              : "Bu sekmede henüz doldurma yok")}
        </span>
        <button className="btn btn-sm" onClick={() => void run("undo")} disabled={!lastFill}>Geri al</button>
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onChange={() => void send<HelperState>({ type: "dh:state" }).then(setState)} />
    </div>
  );
}
