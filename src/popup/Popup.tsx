import { useState, useCallback, useMemo } from "react";
import { Tabs } from "../components/Tabs";
import { DataCard } from "../components/DataCard";
import { TextGenerator } from "../components/TextGenerator";
import { Toast } from "../components/Toast";
import { useClipboard } from "../hooks/useClipboard";
import { useFavorites } from "../hooks/useFavorites";
import { DATA_ITEMS, getDataItemById } from "../data/dataItems";
import "./Popup.css";

interface GeneratedValues {
  [key: string]: string;
}

const TABS = [
  { id: "favorites", label: "Favoriler", icon: "⭐" },
  { id: "financial", label: "Finansal", icon: "💳" },
  { id: "personal", label: "Kişisel", icon: "👤" },
  { id: "text", label: "Metin", icon: "📝" },
];

export function Popup() {
  const { copy, copied } = useClipboard();
  const { favorites, toggleFavorite, isFavorite, loading } = useFavorites();
  const [generatedValues, setGeneratedValues] = useState<GeneratedValues>({});
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites");

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
    [generatedValues]
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
    async (text: string) => {
      const success = await copy(text);
      if (success) {
        setShowToast(true);
      }
    },
    [copy]
  );

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.order - b.order);
  }, [favorites]);

  const getItemsByCategory = (category: string) => {
    return DATA_ITEMS.filter((item) => item.category === category);
  };

  const renderDataCards = (items: typeof DATA_ITEMS) => {
    return items.map((item) => (
      <DataCard
        key={item.id}
        label={item.label}
        value={getValue(item.id)}
        isFavorite={isFavorite(item.id)}
        isLongText={item.isLongText}
        onCopy={() => handleCopy(getValue(item.id))}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onRegenerate={() => regenerate(item.id)}
      />
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "favorites":
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
        return sortedFavorites.map((fav) => {
          const item = getDataItemById(fav.id);
          if (!item) return null;
          return (
            <DataCard
              key={item.id}
              label={item.label}
              value={getValue(item.id)}
              isFavorite={true}
              isLongText={item.isLongText}
              onCopy={() => handleCopy(getValue(item.id))}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onRegenerate={() => regenerate(item.id)}
            />
          );
        });
      case "financial":
        return renderDataCards(getItemsByCategory("financial"));
      case "personal":
        return renderDataCards(getItemsByCategory("personal"));
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
      </header>

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
