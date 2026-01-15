import { useState } from "react";
import type { GeneratorOptions } from "../types";
import { DEFAULT_TEXT_OPTIONS } from "../types";
import { generateText } from "../generators";
import "./TextGenerator.css";

interface TextGeneratorProps {
  onCopy: (text: string) => void;
}

export function TextGenerator({ onCopy }: TextGeneratorProps) {
  const [options, setOptions] =
    useState<GeneratorOptions>(DEFAULT_TEXT_OPTIONS);
  const [generatedText, setGeneratedText] = useState<string>("");

  const handleGenerate = () => {
    const text = generateText(options);
    setGeneratedText(text);
  };

  const handleCopy = () => {
    if (generatedText) {
      onCopy(generatedText);
    }
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(2000, Math.max(1, parseInt(e.target.value) || 1));
    setOptions((prev) => ({ ...prev, length: value }));
  };

  return (
    <div className="text-generator">
      <div className="text-generator-header">
        <span className="text-generator-title">📝 Metin Üretici</span>
      </div>

      <div className="text-generator-options">
        <div className="option-row">
          <label className="option-label">Karakter Sayısı</label>
          <input
            type="number"
            className="option-input"
            value={options.length}
            onChange={handleLengthChange}
            min={1}
            max={2000}
          />
        </div>

        <div className="option-row">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  includeNumbers: e.target.checked,
                }))
              }
            />
            <span>Sayı dahil et</span>
          </label>
        </div>

        <div className="option-row">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.includeSpecialChars}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  includeSpecialChars: e.target.checked,
                }))
              }
            />
            <span>Özel karakter dahil et</span>
          </label>
        </div>

        <div className="option-row">
          <label className="option-label">Harf Tipi</label>
          <select
            className="option-select"
            value={options.caseType}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                caseType: e.target.value as "mixed" | "upper" | "lower",
              }))
            }
          >
            <option value="mixed">Karışık</option>
            <option value="upper">Büyük Harf</option>
            <option value="lower">Küçük Harf</option>
          </select>
        </div>
      </div>

      <div className="text-generator-actions">
        <button className="generate-btn" onClick={handleGenerate}>
          ⚡ Üret
        </button>
        <button
          className="copy-text-btn"
          onClick={handleCopy}
          disabled={!generatedText}
        >
          📋 Kopyala
        </button>
      </div>

      {generatedText && (
        <div className="generated-text">
          <span className="generated-label">Üretilen Metin:</span>
          <div className="generated-content">{generatedText}</div>
        </div>
      )}
    </div>
  );
}
