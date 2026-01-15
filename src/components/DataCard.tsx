import "./DataCard.css";

interface DataCardProps {
  label: string;
  value: string;
  isFavorite: boolean;
  isLongText?: boolean;
  onCopy: () => void;
  onToggleFavorite: () => void;
  onRegenerate?: () => void;
}

export function DataCard({
  label,
  value,
  isFavorite,
  isLongText = false,
  onCopy,
  onToggleFavorite,
  onRegenerate,
}: DataCardProps) {
  return (
    <fieldset className={`data-card ${isLongText ? "long-text" : ""}`}>
      <legend className="data-card-label">{label}</legend>
      <div className="data-card-content">
        <span className="data-card-value" title={value}>
          {value}
        </span>
        <div className="data-card-actions">
          {onRegenerate && (
            <button
              className="action-btn regenerate-btn"
              onClick={onRegenerate}
            >
              <span className="tooltip">Yeniden Üret</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.65 2.35A8 8 0 1 0 16 8h-2a6 6 0 1 1-1.76-4.24L10 6h6V0l-2.35 2.35z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
          <button className="action-btn copy-btn" onClick={onCopy}>
            <span className="tooltip">Kopyala</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button
            className={`action-btn favorite-btn ${
              isFavorite ? "favorite-active" : ""
            }`}
            onClick={onToggleFavorite}
          >
            <span className="tooltip">
              {isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            </span>
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      </div>
    </fieldset>
  );
}
