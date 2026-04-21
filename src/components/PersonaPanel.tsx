import { useCallback, useEffect, useState } from "react";
import { generatePersona, withSeed, type Persona } from "../generators";
import { encodePersona } from "../storage/share";
import { DataCard } from "./DataCard";
import "./PersonaPanel.css";

interface PersonaPanelProps {
  onCopy: (value: string) => void;
}

const FIELDS: ReadonlyArray<{
  id: keyof Persona;
  label: string;
  isLongText?: boolean;
}> = [
  { id: "fullName", label: "Ad Soyad" },
  { id: "tckn", label: "TC Kimlik No" },
  { id: "birthDate", label: "Doğum Tarihi" },
  { id: "email", label: "E-posta" },
  { id: "kepEmail", label: "KEP E-posta" },
  { id: "username", label: "Kullanıcı Adı" },
  { id: "phone", label: "Telefon" },
  { id: "iban", label: "IBAN" },
  { id: "creditCard", label: "Kredi Kartı" },
  { id: "cvv", label: "CVV" },
  { id: "cardExpiry", label: "Son Kullanma" },
  { id: "country", label: "Ülke" },
  { id: "city", label: "İl" },
  { id: "district", label: "İlçe" },
  { id: "neighborhood", label: "Mahalle" },
  { id: "street", label: "Cadde/Sokak" },
  { id: "buildingNo", label: "Bina No" },
  { id: "apartmentNo", label: "Daire No" },
  { id: "postalCode", label: "Posta Kodu" },
  { id: "plate", label: "Plaka" },
  { id: "passport", label: "Pasaport No" },
  { id: "address", label: "Tam Adres", isLongText: true },
];

const STORAGE_KEY = "currentPersona";

export function PersonaPanel({ onCopy }: PersonaPanelProps) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [seed, setSeed] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await chrome.storage.session.get(STORAGE_KEY);
        if (stored[STORAGE_KEY]) {
          setPersona(stored[STORAGE_KEY] as Persona);
        } else {
          const fresh = generatePersona();
          await chrome.storage.session.set({ [STORAGE_KEY]: fresh });
          setPersona(fresh);
        }
      } catch {
        setPersona(generatePersona());
      }
    };
    load();
  }, []);

  const regenerate = useCallback(async () => {
    const trimmed = seed.trim();
    const fresh = trimmed
      ? withSeed(trimmed, () => generatePersona())
      : generatePersona();
    setPersona(fresh);
    try {
      await chrome.storage.session.set({ [STORAGE_KEY]: fresh });
    } catch {
      /* session storage yoksa yut */
    }
  }, [seed]);

  if (!persona) {
    return (
      <div className="persona-empty">
        <span>Persona yükleniyor…</span>
      </div>
    );
  }

  const genderLabel = persona.gender === "male" ? "Erkek" : "Kadın";

  const copyAsJson = () => {
    onCopy(JSON.stringify(persona, null, 2));
  };

  const shareCode = () => {
    if (persona) onCopy(encodePersona(persona));
  };

  const downloadBulkCsv = () => {
    const rows = 25;
    const personas = Array.from({ length: rows }, () => generatePersona());
    const columns: Array<keyof Persona> = [
      "fullName",
      "gender",
      "birthDate",
      "tckn",
      "email",
      "kepEmail",
      "username",
      "phone",
      "iban",
      "creditCard",
      "cvv",
      "cardExpiry",
      "city",
      "district",
      "postalCode",
      "plate",
      "passport",
      "address",
    ];
    const escape = (v: string) =>
      /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    const csv = [
      columns.join(","),
      ...personas.map((p) =>
        columns.map((c) => escape(String(p[c] ?? ""))).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-helper-persona-${rows}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="persona-panel">
      <div className="persona-header">
        <div>
          <div className="persona-name">{persona.fullName}</div>
          <div className="persona-meta">
            {genderLabel} · {persona.birthDate} · {persona.city}
          </div>
        </div>
        <div className="persona-actions">
          <button
            type="button"
            className="persona-regen"
            onClick={copyAsJson}
            title="Tüm persona alanlarını JSON olarak kopyala"
          >
            📋 JSON
          </button>
          <button
            type="button"
            className="persona-regen"
            onClick={downloadBulkCsv}
            title="25 rastgele persona'yı CSV olarak indir"
          >
            ⬇ CSV
          </button>
          <button
            type="button"
            className="persona-regen"
            onClick={shareCode}
            title="Bu personayı paylaşılabilir kod olarak kopyala"
          >
            🔗 Paylaş
          </button>
          <button
            type="button"
            className="persona-regen"
            onClick={regenerate}
            title="Yeni kişi üret"
          >
            🔄 Yeni
          </button>
        </div>
      </div>
      <div className="persona-hint">
        Sağ-tık menüsündeki “Persona” alt dalı da bu kişiyi kullanır.
      </div>
      <div className="persona-seed">
        <input
          type="text"
          placeholder="Seed (opsiyonel, aynı seed = aynı kişi)"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          spellCheck={false}
        />
      </div>
      {FIELDS.map((f) => {
        const value = String(persona[f.id] ?? "");
        return (
          <DataCard
            key={f.id}
            label={f.label}
            value={value}
            isFavorite={false}
            isLongText={f.isLongText}
            onCopy={() => onCopy(value)}
            onToggleFavorite={() => {
              /* persona tabında favori yok */
            }}
            onRegenerate={regenerate}
          />
        );
      })}
    </div>
  );
}
