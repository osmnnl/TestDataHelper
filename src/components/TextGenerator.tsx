import { useState } from "react";
import type { GeneratorOptions } from "../types";
import { DEFAULT_TEXT_OPTIONS } from "../types";
import { generateText, generateFromPattern } from "../generators";
import { Icon } from "../app/Icon";

interface TextGeneratorProps {
  onCopy: (text: string) => void;
}

const CASES: ReadonlyArray<{ id: NonNullable<GeneratorOptions["caseType"]>; label: string }> = [
  { id: "mixed", label: "Karışık" },
  { id: "upper", label: "BÜYÜK" },
  { id: "lower", label: "küçük" },
];

function runPattern(pattern: string): { out: string; error: string | null } {
  try {
    return { out: generateFromPattern(pattern), error: null };
  } catch (e) {
    return { out: "", error: e instanceof Error ? e.message : "Geçersiz kalıp" };
  }
}

export function TextGenerator({ onCopy }: TextGeneratorProps) {
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_TEXT_OPTIONS);
  const [text, setText] = useState(() => generateText(DEFAULT_TEXT_OPTIONS));
  const [pattern, setPattern] = useState("[A-Z]{3}-\\d{5}");
  const [patternResult, setPatternResult] = useState(() => runPattern("[A-Z]{3}-\\d{5}"));

  // Seçenek değişince metin hemen yeniden üretilir; ayrı "Üret" adımı yok
  const update = (patch: Partial<GeneratorOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    setText(generateText(next));
  };

  const changePattern = (value: string) => {
    setPattern(value);
    setPatternResult(runPattern(value));
  };

  return (
    <>
      <section className="gen" aria-label="Metin üretici">
        <span className="section-label">Metin</span>
        <div className="gen-row">
          <label className="gen-row" style={{ gap: 8 }}>
            Uzunluk
            <input
              type="number"
              className="input input--num"
              value={options.length}
              min={1}
              max={2000}
              onChange={(e) => update({ length: Math.min(2000, Math.max(1, parseInt(e.target.value) || 1)) })}
            />
          </label>
          <div className="seg" role="group" aria-label="Harf tipi">
            {CASES.map((c) => (
              <button key={c.id} type="button" className={options.caseType === c.id ? "is-on" : ""} aria-pressed={options.caseType === c.id} onClick={() => update({ caseType: c.id })}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="gen-checks">
          <label>
            <input type="checkbox" checked={!!options.includeNumbers} onChange={(e) => update({ includeNumbers: e.target.checked })} />
            Sayı
          </label>
          <label>
            <input type="checkbox" checked={!!options.includeSpecialChars} onChange={(e) => update({ includeSpecialChars: e.target.checked })} />
            Özel karakter
          </label>
        </div>
        <div className="output">
          <span className="output-text">{text}</span>
          <button type="button" className="icon-btn" aria-label="Yeniden üret" title="Yeniden üret" onClick={() => setText(generateText(options))}>
            <Icon name="refresh" />
          </button>
          <button type="button" className="icon-btn" aria-label="Metni kopyala" title="Kopyala" onClick={() => onCopy(text)}>
            <Icon name="copy" />
          </button>
        </div>
      </section>

      <section className="gen" aria-label="Kalıptan üret">
        <span className="section-label">Kalıp</span>
        <input
          type="text"
          className="input input--mono"
          value={pattern}
          onChange={(e) => changePattern(e.target.value)}
          spellCheck={false}
          aria-label="Kalıp"
        />
        <div className="output">
          <span className={`output-text${patternResult.error ? " is-error" : ""}`}>{patternResult.error ?? patternResult.out}</span>
          <button type="button" className="icon-btn" aria-label="Yeniden üret" title="Yeniden üret" onClick={() => setPatternResult(runPattern(pattern))}>
            <Icon name="refresh" />
          </button>
          <button type="button" className="icon-btn" aria-label="Sonucu kopyala" title="Kopyala" disabled={!patternResult.out} onClick={() => onCopy(patternResult.out)}>
            <Icon name="copy" />
          </button>
        </div>
        <span className="hint">[A-Z] harf, \d rakam, {"{3}"} tekrar. Örnek: [A-Z]{"{2}"}\d{"{4}"} → KT4821</span>
      </section>
    </>
  );
}
