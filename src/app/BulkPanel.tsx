import { useEffect, useMemo, useState } from "react";
import type { Company } from "../generators";
import { BULK_COLUMNS, DEFAULT_COLUMNS, buildRows, toCSV, toXLSX, type BulkTemplate } from "../shared/bulk";
import { Icon } from "./Icon";

const TEMPLATES_KEY = "dh.bulkTemplates";
const LAST_KEY = "dh.bulkLast";

function download(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function BulkPanel({ company, onStatus }: { company: Company; onStatus: (m: string) => void }) {
  const [count, setCount] = useState(100);
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [templates, setTemplates] = useState<BulkTemplate[]>([]);
  const [templateName, setTemplateName] = useState("Personel aktarımı");

  useEffect(() => {
    void chrome.storage.local.get([TEMPLATES_KEY, LAST_KEY]).then((s) => {
      setTemplates((s[TEMPLATES_KEY] as BulkTemplate[]) ?? []);
      const last = s[LAST_KEY] as BulkTemplate | undefined;
      if (last) {
        setColumns(last.columns);
        setFormat(last.format);
        setTemplateName(last.name);
      }
    });
  }, []);

  // Seçili kolonlar sıralı başta, diğerleri katalog sırasıyla sonra
  const ordered = useMemo(() => {
    const sel = columns.map((id) => BULK_COLUMNS.find((c) => c.id === id)!).filter(Boolean);
    return [...sel, ...BULK_COLUMNS.filter((c) => !columns.includes(c.id))];
  }, [columns]);

  const preview = useMemo(() => buildRows(3, columns.slice(0, 6), company), [columns, company]);

  const toggle = (id: string) =>
    setColumns((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]));
  const move = (id: string, dir: -1 | 1) =>
    setColumns((cs) => {
      const i = cs.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cs.length) return cs;
      const next = [...cs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const applyTemplate = (name: string) => {
    const t = templates.find((x) => x.name === name);
    if (!t) return;
    setTemplateName(t.name);
    setColumns(t.columns);
    setFormat(t.format);
  };

  const saveTemplate = async () => {
    const name = templateName.trim() || "Şablon";
    const t: BulkTemplate = { name, columns, format };
    const next = [...templates.filter((x) => x.name !== name), t];
    setTemplates(next);
    await chrome.storage.local.set({ [TEMPLATES_KEY]: next, [LAST_KEY]: t });
    onStatus(`“${name}” şablonu kaydedildi`);
  };

  const n = Math.max(1, Math.min(5000, count || 1));
  const fileName = `${(templateName.trim() || "veri").toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşıöç]+/g, "-")}-${n}.${format}`;

  const generate = async () => {
    if (!columns.length) return onStatus("En az bir kolon seçin");
    const rows = buildRows(n, columns, company);
    if (format === "csv") download(fileName, toCSV(rows), "text/csv;charset=utf-8");
    else download(fileName, toXLSX(rows) as BlobPart, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await chrome.storage.local.set({ [LAST_KEY]: { name: templateName, columns, format } });
    onStatus(`${n} satır · ${fileName}`);
  };

  return (
    <div className="bulk">
      <div className="bulk-grid">
        <label className="field">
          <span>Kişi sayısı</span>
          <input type="number" min={1} max={5000} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <div className="field">
          <span>Biçim</span>
          <div className="seg" role="group" aria-label="Dosya biçimi">
            <button aria-pressed={format === "csv"} className={format === "csv" ? "is-on" : ""} onClick={() => setFormat("csv")}>CSV</button>
            <button aria-pressed={format === "xlsx"} className={format === "xlsx" ? "is-on" : ""} onClick={() => setFormat("xlsx")}>XLSX</button>
          </div>
        </div>
        <label className="field">
          <span>Şablon</span>
          <select value={templates.some((t) => t.name === templateName) ? templateName : ""} onChange={(e) => applyTemplate(e.target.value)}>
            <option value="">{templates.length ? "Kayıtlı şablon seç" : "Kayıtlı şablon yok"}</option>
            {templates.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </label>
      </div>

      <div className="cols-head">
        <span>Kolonlar · oklarla sırala</span>
        <span>{columns.length} / {BULK_COLUMNS.length} seçili</span>
      </div>
      <ul className="cols">
        {ordered.map((c) => {
          const on = columns.includes(c.id);
          return (
            <li key={c.id} className={`col${on ? "" : " is-off"}`}>
              <label>
                <input type="checkbox" checked={on} onChange={() => toggle(c.id)} />
                <span>{c.label.replace(/ · .*$/, "")}</span>
              </label>
              {on && (
                <span className="col-move">
                  <button className="icon-btn icon-btn--xs" aria-label={`${c.label} yukarı`} onClick={() => move(c.id, -1)}><Icon name="up" size={12} /></button>
                  <button className="icon-btn icon-btn--xs" aria-label={`${c.label} aşağı`} onClick={() => move(c.id, 1)}><Icon name="down" size={12} /></button>
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="cols-head"><span>Önizleme · ilk 3 satır, ilk 6 kolon</span></div>
      <div className="table-wrap">
        <table>
          <tbody>
            {preview.map((r, i) => (
              <tr key={i} className={i === 0 ? "th" : ""}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className="field">
        <span>Şablon adı</span>
        <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
      </label>
      <div className="fill-row">
        <button className="btn-primary" onClick={() => void generate()}>İndir · {fileName}</button>
        <button className="btn" onClick={() => void saveTemplate()}>Şablonu kaydet</button>
      </div>
      <p className="note">CSV: UTF-8, “;” ayraçlı (Türkçe Excel doğrudan açar). Tüm hücreler metin; TCKN ve IBAN haneleri korunur.</p>
    </div>
  );
}
