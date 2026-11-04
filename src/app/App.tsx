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

type PopupTab = "favorites" | "person" | "company" | "finance" | "address" | "text" | "bulk";

const POPUP_TABS: ReadonlyArray<{ id: PopupTab; short: string; icon: string; from: TabId[] }> = [
  { id: "favorites", short: "Favori", icon: "star", from: [] },
  { id: "person", short: "Kişi", icon: "person", from: ["person", "date"] },
  { id: "company", short: "Şirket", icon: "building", from: ["company"] },
  { id: "finance", short: "Finans", icon: "card", from: ["finance"] },
  { id: "address", short: "Adres", icon: "pin", from: ["address"] },
  { id: "text", short: "Metin", icon: "lines", from: [] },
  { id: "bulk", short: "Toplu", icon: "table", from: [] },
];

const TAB_LABEL: Record<TabId, string> = { person: "Kişi", date: "Kişi", company: "Şirket", finance: "Finans", address: "Adres", text: "Metin" };

const IS_MAC = navigator.userAgent.includes("Mac");
const FORM_KEY = IS_MAC ? "⌘⇧F" : "Ctrl+Shift+F";

type LastFill = (RunResult & { ts: number }) | null;

function send<T>(msg: unknown): Promise<T> {
  return chrome.runtime.sendMessage(msg) as Promise<T>;
}

/** Aramada "iban" = "IBAN", "sehir" = "Şehir": Türkçe küçük harf, ı→i, aksan yok */
function fold(text: string) {
  return text.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function recordCopy(label: string, value: string) {
  void appendHistory({ label, value, ts: Date.now(), source: "popup" });
}

function displayDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function App({ variant }: { variant: "popup" | "panel" }) {
  const [state, setState] = useState<HelperState | null>(null);
  // Kullanıcı sekme seçene kadar: favori varsa Favoriler, yoksa Kişi
  const [chosenTab, setTab] = useState<PopupTab | null>(null);
  const [tabId, setTabId] = useState<number | null>(null);
  const [windowId, setWindowId] = useState<number | null>(null);
  const [lastFill, setLastFill] = useState<LastFill>(null);
  const [status, setStatus] = useState<string>("");
  const [needsPermission, setNeedsPermission] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { favorites, loading: favLoading, isFavorite, toggleFavorite } = useFavorites();
  const tab: PopupTab = chosenTab ?? (!favLoading && favorites.length > 0 ? "favorites" : "person");

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

  const copy = async (label: string, value: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      flash(`${label} kopyalandı`);
      if (id) {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
      }
      recordCopy(label, value);
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

  const q = fold(query.trim());
  const rows = useMemo(() => {
    if (!state) return [];
    // Arama yazılınca tüm sekmelerde ad ve değere göre süzülür
    if (q) return CATALOG.filter((c) => c.tab !== "text" && fold(`${c.label} ${c.get(state)}`).includes(q));
    if (tab === "favorites") {
      return [...favorites]
        .sort((a, b) => a.order - b.order)
        .flatMap((f) => CATALOG.filter((c) => c.id === f.id && c.tab !== "text"));
    }
    const from = POPUP_TABS.find((t) => t.id === tab)?.from ?? [];
    const items = CATALOG.filter((c) => from.includes(c.tab));
    // Favoriler sekmenin başında
    return [...items.filter((i) => isFavorite(i.id)), ...items.filter((i) => !isFavorite(i.id))];
  }, [state, tab, q, favorites, isFavorite]);
  const mixed = !!q || tab === "favorites";

  if (!state) return <div className={`app app--${variant}`} />;
  const p = state.persona;

  return (
    <div className={`app app--${variant}`}>
      <nav className="rail" role="tablist" aria-label="Veri grupları" aria-orientation="vertical">
        <img className="logo" src="icons/icon48.png" alt="Data Helper" width={24} height={24} />
        {POPUP_TABS.map((t) => {
          const on = !q && tab === t.id;
          return (
            <button key={t.id} role="tab" aria-selected={on} className={`rail-item${on ? " is-active" : ""}`} onClick={() => { setTab(t.id); setQuery(""); }}>
              <Icon name={t.icon} filled={t.id === "favorites" && on} size={18} />
              <span>{t.short}</span>
              {t.id === "favorites" && favorites.length > 0 && <span className="rail-count">{favorites.length}</span>}
            </button>
          );
        })}
        <span className="rail-spacer" />
        {variant === "popup" && (
          <button className="icon-btn" aria-label="Yan paneli aç" title="Yan paneli aç" onClick={openPanel}>
            <Icon name="panel" />
          </button>
        )}
        <button className="icon-btn" aria-label="Ayarlar" title="Ayarlar" onClick={() => setSettingsOpen(true)}>
          <Icon name="settings" />
        </button>
      </nav>

      <main className="main">
        <header className="persona" aria-label="Geçerli kişi">
          <div className="persona-line">
            <span className="persona-name">{p.fullName}</span>
            <button className="pill" onClick={() => void regenerate("persona")} disabled={state.locked} title={state.locked ? "Kilitliyken yenilenmez" : "Yeni kişi üret"}>
              <Icon name="refresh" size={12} /> Yeni
            </button>
            <button className={`pill${state.locked ? " is-on" : ""}`} aria-pressed={state.locked} title="Kilitliyken doldurmalarda aynı kişi kalır" onClick={() => void toggleLock()}>
              <Icon name={state.locked ? "lock" : "unlock"} size={12} /> {state.locked ? "Kilitli" : "Kilitle"}
            </button>
          </div>
          <span className="persona-meta">
            {p.gender === "female" ? "Kadın" : "Erkek"} · {p.birthDate} · {p.city} / {p.district} · İşe giriş {displayDate(p.dates.hire)}
          </span>
        </header>

        <div className="search">
          <Icon name="search" size={14} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tüm verilerde ara" aria-label="Verilerde ara" />
        </div>

        {needsPermission && (
          <div className="perm">
            <span>Yan panelden doldurmak için {needsPermission} izni gerekiyor.</span>
            <button className="pill" onClick={() => void grant()}>İzin ver</button>
          </div>
        )}

        <div className="body">
          {!q && tab === "text" ? (
            <div className="pad">
              <TextGenerator onCopy={(v) => void copy("Metin", v)} />
              <HistoryPanel onCopy={(v) => void copy("Değer", v)} />
            </div>
          ) : !q && tab === "bulk" ? (
            <BulkPanel company={state.company} onStatus={flash} />
          ) : (
            <>
              {!q && tab === "company" && (
                <div className="subhead">
                  <span>{state.company.name}</span>
                  <button className="pill" onClick={() => void regenerate("company")}><Icon name="refresh" size={12} /> Yeni şirket</button>
                </div>
              )}
              <ul className="rows">
                {rows.map((item) => {
                  const value = item.get(state);
                  const shown = item.display?.(state) ?? value;
                  const check = item.check?.(state);
                  const fav = isFavorite(item.id);
                  const copied = copiedId === item.id;
                  return (
                    <li key={item.id} className={`row${copied ? " is-copied" : ""}`}>
                      <button type="button" className="row-main" title={`${shown} · tıkla, kopyala`} onClick={() => void copy(item.label, value, item.id)}>
                        <span className="row-label">
                          {item.label}
                          {mixed && <span className="row-tab">{TAB_LABEL[item.tab]}</span>}
                        </span>
                        <span className="row-value">
                          {copied ? "Kopyalandı" : shown}
                          {check && !copied && <span className="row-check" title={check} aria-label={check} />}
                        </span>
                      </button>
                      <button className={`row-icon fav-btn${fav ? " is-fav" : ""}`} aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"} aria-pressed={fav} title={fav ? "Favorilerden çıkar" : "Favorilere ekle"} onClick={() => void toggleFavorite(item.id)}>
                        <Icon name="star" filled={fav} size={14} />
                      </button>
                      <button className="row-icon copy-btn" aria-label={`${item.label} kopyala`} onClick={() => void copy(item.label, value, item.id)}>
                        <Icon name={copied ? "check" : "copy"} size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {q && rows.length === 0 && <p className="empty">“{query}” için sonuç yok</p>}
              {!q && tab === "favorites" && rows.length === 0 && (
                <p className="empty">
                  <strong>Henüz favori yok</strong>
                  Bir satırın üzerine gelip yıldıza bas; sık kullandıkların burada toplanır.
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bar">
        <span className="bar-status" role="status">
          {status ||
            (lastFill
              ? `Son doldurma: ${lastFill.filled} alan${lastFill.skipped ? ` · ${lastFill.skipped} atlandı` : ""}${lastFill.mismatches.length ? ` · ${lastFill.mismatches.length} tutmadı` : ""}`
              : "Bu sekmede henüz doldurma yok")}
        </span>
        <div className="bar-actions">
          <button className="btn-primary" onClick={() => void run("form")} disabled={busy || !tabId}>
            {busy ? "Dolduruluyor…" : "Bu formu doldur"} <kbd>{FORM_KEY}</kbd>
          </button>
          <button className="btn" onClick={() => void preview()} disabled={!tabId}>Önizle</button>
          <button className="btn" onClick={() => void run("undo")} disabled={!lastFill}>Geri al</button>
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onChange={() => void send<HelperState>({ type: "dh:state" }).then(setState)} />
    </div>
  );
}
