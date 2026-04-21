import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Tabs } from "../components/Tabs";
import { DataCard } from "../components/DataCard";
import { TextGenerator } from "../components/TextGenerator";
import { PersonaPanel } from "../components/PersonaPanel";
import { HistoryPanel } from "../components/HistoryPanel";
import { SettingsModal } from "../components/SettingsModal";
import { Toast } from "../components/Toast";
import { appendHistory } from "../storage/history";
import { useClipboard } from "../hooks/useClipboard";
import { useFavorites } from "../hooks/useFavorites";
import { DATA_ITEMS, getDataItemById } from "../data/dataItems";
import "./Popup.css";

interface GeneratedValues {
  [key: string]: string;
}

const TABS = [
  { id: "favorites", label: "Favoriler", icon: "⭐" },
  { id: "persona", label: "Persona", icon: "🧑" },
  { id: "financial", label: "Finansal", icon: "💳" },
  { id: "personal", label: "Kişisel", icon: "👤" },
  { id: "text", label: "Metin", icon: "📝" },
  { id: "history", label: "Geçmiş", icon: "📜" },
];

export function Popup() {
  const { copy, copied } = useClipboard();
  const { favorites, toggleFavorite, isFavorite, loading, reorder } =
    useFavorites();
  const [generatedValues, setGeneratedValues] = useState<GeneratedValues>({});
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites");
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const draggingId = useRef<string | null>(null);

  // `/` kısayolu ile arama kutusuna odaklan
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const getValue = useCallback(
    (id: string): string => {
      if (generatedValues[id]) {
        return generatedValues[id];
      }
      const item = getDataItemById(id);
      if (item) {
        const value = item.generator();
        setGeneratedValues((prev) => ({ ...prev, [id]: value }));
        return value;
      }
      return "";
    },
    [generatedValues],
  );

  const regenerate = useCallback((id: string) => {
    const item = getDataItemById(id);
    if (item) {
      const value = item.generator();
      setGeneratedValues((prev) => ({ ...prev, [id]: value }));
    }
  }, []);

  const regenerateAll = useCallback(() => {
    const newValues: GeneratedValues = {};
    DATA_ITEMS.forEach((item) => {
      newValues[item.id] = item.generator();
    });
    setGeneratedValues(newValues);
  }, []);

  const handleCopy = useCallback(
    async (text: string, label?: string) => {
      const success = await copy(text);
      if (success) {
        setShowToast(true);
        if (label) {
          void appendHistory({
            label,
            value: text,
            ts: Date.now(),
            source: "popup",
          });
        }
      }
    },
    [copy],
  );

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.order - b.order);
  }, [favorites]);

  const normalizedQuery = query.trim().toLowerCase();
  const queryActive = normalizedQuery.length > 0;

  const getItemsByCategory = (category: string) => {
    return DATA_ITEMS.filter((item) => item.category === category);
  };

  const matchesQuery = (label: string) =>
    label.toLowerCase().includes(normalizedQuery);

  const renderDataCards = (items: typeof DATA_ITEMS) => {
    const list = queryActive ? items.filter((i) => matchesQuery(i.label)) : items;
    if (list.length === 0) {
      return (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>Eşleşen veri yok</p>
        </div>
      );
    }
    return list.map((item) => (
      <DataCard
        key={item.id}
        label={item.label}
        value={getValue(item.id)}
        isFavorite={isFavorite(item.id)}
        isLongText={item.isLongText}
        onCopy={() => handleCopy(getValue(item.id), item.label)}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onRegenerate={() => regenerate(item.id)}
      />
    ));
  };

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = draggingId.current;
    draggingId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const ordered = sortedFavorites.map((f) => f.id);
    const from = ordered.indexOf(sourceId);
    const to = ordered.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ordered.splice(from, 1);
    ordered.splice(to, 0, sourceId);
    void reorder(ordered);
  };

  const renderFavorites = () => {
    if (sortedFavorites.length === 0) {
      return (
        <div className="empty-state">
          <span className="empty-icon">⭐</span>
          <p>Henüz favori eklenmedi</p>
          <span className="empty-hint">
            Diğer sekmelerdeki verileri favorileyebilirsiniz
          </span>
        </div>
      );
    }
    const visible = queryActive
      ? sortedFavorites.filter((fav) => {
          const item = getDataItemById(fav.id);
          return item && matchesQuery(item.label);
        })
      : sortedFavorites;

    if (visible.length === 0) {
      return (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>Eşleşen favori yok</p>
        </div>
      );
    }

    return visible.map((fav) => {
      const item = getDataItemById(fav.id);
      if (!item) return null;
      return (
        <div
          key={item.id}
          draggable={!queryActive}
          onDragStart={handleDragStart(item.id)}
          onDragOver={handleDragOver}
          onDrop={handleDrop(item.id)}
          className="favorite-row"
        >
          <DataCard
            label={item.label}
            value={getValue(item.id)}
            isFavorite={true}
            isLongText={item.isLongText}
            onCopy={() => handleCopy(getValue(item.id), item.label)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onRegenerate={() => regenerate(item.id)}
          />
        </div>
      );
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "favorites":
        return renderFavorites();
      case "financial":
        return renderDataCards(getItemsByCategory("financial"));
      case "personal":
        return renderDataCards(getItemsByCategory("personal"));
      case "persona":
        return <PersonaPanel onCopy={handleCopy} />;
      case "history":
        return <HistoryPanel onCopy={handleCopy} />;
      case "text":
        return <TextGenerator onCopy={handleCopy} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="popup loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="popup">
      <header className="popup-header">
        <div className="header-left">
          <img src="/icons/icon48.png" alt="Logo" className="header-logo" />
          <h1 className="header-title">Data Helper</h1>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={async () => {
              try {
                const [tab] = await chrome.tabs.query({
                  active: true,
                  currentWindow: true,
                });
                if (tab?.windowId !== undefined) {
                  await chrome.sidePanel.open({ windowId: tab.windowId });
                  window.close();
                }
              } catch {
                /* sidePanel API yoksa yut */
              }
            }}
            title="Side Panel'e aç"
            aria-label="Side Panel'e aç"
          >
            ⇨
          </button>
          <button
            className="refresh-btn"
            onClick={() => setSettingsOpen(true)}
            title="Ayarlar"
            aria-label="Ayarlar"
          >
            ⚙
          </button>
          <button
            className="refresh-btn"
            onClick={regenerateAll}
            title="Tümünü yenile"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.65 2.35A8 8 0 1 0 16 8h-2a6 6 0 1 1-1.76-4.24L10 6h6V0l-2.35 2.35z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </header>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <div className="popup-search">
        <input
          ref={searchRef}
          type="text"
          placeholder="Ara (/  →  tıklat)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
        />
        {queryActive && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setQuery("")}
            title="Aramayı temizle"
          >
            ✕
          </button>
        )}
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="popup-content">{renderTabContent()}</main>

      <Toast
        message="Kopyalandı"
        visible={showToast || copied}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}
