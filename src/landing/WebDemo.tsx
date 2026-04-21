import { useState } from "react";
import { generatePersona, type Persona } from "../generators";
import "./WebDemo.css";

const FIELDS: Array<{ key: keyof Persona; label: string }> = [
  { key: "fullName", label: "Ad Soyad" },
  { key: "tckn", label: "TC Kimlik No" },
  { key: "birthDate", label: "Doğum Tarihi" },
  { key: "email", label: "E-posta" },
  { key: "phone", label: "Telefon" },
  { key: "iban", label: "IBAN" },
  { key: "creditCard", label: "Kredi Kartı" },
  { key: "cvv", label: "CVV" },
  { key: "cardExpiry", label: "Son Kullanma" },
  { key: "postalCode", label: "Posta Kodu" },
  { key: "plate", label: "Plaka" },
];

export function WebDemo() {
  const [persona, setPersona] = useState<Persona>(() => generatePersona());
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard yoksa yut */
    }
  };

  return (
    <section className="web-demo" id="demo">
      <div className="web-demo-inner">
        <div className="web-demo-header">
          <div>
            <h2>Hemen Dene</h2>
            <p>
              Eklentiyi kurmadan üreticiyi bu sayfada deneyebilirsin. Her şey
              tarayıcında çalışır — sunucuya hiçbir şey gönderilmez.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPersona(generatePersona())}
            className="web-demo-regen"
          >
            🔄 Yeni Kişi
          </button>
        </div>

        <div className="web-demo-grid">
          {FIELDS.map((f) => {
            const value = String(persona[f.key] ?? "");
            return (
              <button
                key={f.key}
                type="button"
                className="web-demo-card"
                onClick={() => copy(f.key, value)}
                title="Tıklayıp kopyala"
              >
                <span className="web-demo-label">{f.label}</span>
                <span className="web-demo-value">{value}</span>
                {copied === f.key && (
                  <span className="web-demo-copied">✓ Kopyalandı</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
