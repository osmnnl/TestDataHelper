/**
 * Sayfa içi doldurma motoru. Service worker bu dosyayı
 * `chrome.scripting.executeScript({ files: ["engine.js"] })` ile sekmenin
 * tüm çerçevelerine bir kez yükler, sonra `window.__dataHelper.run(...)` çağırır.
 *
 * - Yalnız tıklanan / odaktaki alanın formunu (form, diyalog ya da en yakın
 *   alan grubu) doldurur.
 * - Özel açılır listelerde (react-select, MUI, AntD, role=combobox) gerçekten
 *   seçenek seçer; maskeli alanlara karakter karakter yazar; tarih biçimini
 *   alandan çıkarır.
 * - Doldurduktan sonra değerleri yeniden okur, tutmayanları işaretler;
 *   son doldurmayı geri alabilir.
 */

import { classifyField, isDateKind, normalizeTr, KIND_LABELS, type FieldKind } from "../shared/matcher";
import { valueFor, type FillContext, type FieldValue } from "../shared/values";

export type RunMode = "form" | "preview" | "field" | "insert" | "option" | "undo" | "copy" | "probe";

export interface RunArgs {
  mode: RunMode;
  ctx?: FillContext;
  /** insert / copy için metin */
  text?: string;
  /** Doğrudan çağrıda hangi çerçevenin iş yapacağı belli (sağ tık menüsü) */
  targeted?: boolean;
}

export interface RunResult {
  acted: boolean;
  filled: number;
  skipped: number;
  mismatches: string[];
  message?: string;
  scopeLabel?: string;
}

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLElement;

interface Planned {
  el: Control;
  kind: FieldKind;
  label: string;
  control: "text" | "select" | "combobox" | "checkbox" | "radio" | "date" | "time" | "editable";
  value: FieldValue | null;
}

interface UndoEntry {
  el: Control;
  type: "value" | "checked" | "select" | "combobox";
  prev: string | boolean;
}

declare global {
  interface Window {
    __dataHelper?: { run: (a: RunArgs) => Promise<RunResult | null>; version: number };
  }
}

const VERSION = 2;
const HOST_ID = "data-helper-ui";
const SKIP_TYPES = new Set(["hidden", "file", "submit", "button", "reset", "image"]);
const CONSENT_RE = /kvkk|onay|kabul|okudum|aydinlatma|sozlesme|agree|accept|terms|consent/;
const PLACEHOLDER_OPTION_RE = /^(seciniz|secin|sec|select|choose|lutfen seciniz|hepsi|tumu|bos|none|)$/;

let lastContextTarget: Element | null = null;
let lastUndo: UndoEntry[] = [];

// ---- Yardımcılar ----------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor<T>(fn: () => T | null | undefined | false, timeout = 1200, step = 40): Promise<T | null> {
  const end = Date.now() + timeout;
  for (;;) {
    const v = fn();
    if (v) return v;
    if (Date.now() > end) return null;
    await sleep(step);
  }
}

function isVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const st = getComputedStyle(el);
  return st.visibility !== "hidden" && st.display !== "none";
}

function textOf(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function deepActive(doc: Document): Element | null {
  let a: Element | null = doc.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a && a !== doc.body && a !== doc.documentElement ? a : null;
}

function isOwnUi(el: Element): boolean {
  return !!el.closest(`#${HOST_ID}`);
}

function isCombobox(el: Element): boolean {
  if (el.getAttribute("role") === "combobox") return true;
  if (el.getAttribute("aria-haspopup") === "listbox") return true;
  if (el instanceof HTMLInputElement && el.getAttribute("aria-autocomplete") === "list") return true;
  return false;
}

/** Tıklanan öğeden doldurulabilir kontrole: react-select kontrol div'i → içindeki input. */
function resolveControl(el: Element | null): Control | null {
  if (!el || isOwnUi(el)) return null;
  if (el.matches("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return el as Control;
  const inner = el.querySelector?.("input:not([type=hidden]), textarea, select, [role=combobox]");
  if (inner && el.querySelectorAll("input:not([type=hidden]), textarea, select").length === 1) return inner as Control;
  const host = el.closest("[class*='-container'], .MuiAutocomplete-root, .ant-select, [class*='select' i]");
  const hostInput = host?.querySelector("input:not([type=hidden]), [role=combobox]");
  if (hostInput) return hostInput as Control;
  if (isCombobox(el)) return el as HTMLElement;
  return null;
}

function isFillable(el: Element): boolean {
  if (isOwnUi(el)) return false;
  if (el instanceof HTMLInputElement) {
    if (SKIP_TYPES.has(el.type)) return false;
    if (el.disabled) return false;
    if (el.readOnly && !isCombobox(el) && !el.closest(".ant-select, .react-datepicker-wrapper")) return false;
  } else if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    if (el.disabled || (el instanceof HTMLTextAreaElement && el.readOnly)) return false;
  } else if (el.getAttribute("aria-disabled") === "true") return false;
  // MUI / özel onay kutuları görünmez input taşır; kapsayıcısı görünürse yeter
  const box = el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")
    ? el.parentElement ?? el
    : el;
  return isVisible(box);
}

function collect(scope: ParentNode): Control[] {
  const raw = Array.from(
    scope.querySelectorAll(
      "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role=combobox]:not(input), [aria-haspopup=listbox]:not(input):not(button)",
    ),
  );
  const out: Control[] = [];
  for (const el of raw) {
    if (!isFillable(el)) continue;
    // combobox div içinde zaten input varsa div'i atla
    if (!(el instanceof HTMLInputElement) && el.querySelector("input:not([type=hidden])")) continue;
    out.push(el as Control);
  }
  return out;
}

// ---- Etiket ---------------------------------------------------------------

function labelFor(el: Element): string {
  const doc = el.ownerDocument;
  const id = el.id;
  if (id) {
    try {
      const l = doc.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (l && textOf(l)) return textOf(l);
    } catch { /* noop */ }
  }
  const wrap = el.closest("label");
  if (wrap) {
    // Saran label'ın kendi metni: içindeki liste seçenekleri ve alan değerleri hariç
    const own = wrap.cloneNode(true) as Element;
    own.querySelectorAll("select, option, input, textarea, button, [role='listbox'], [role='option']").forEach((n) => n.remove());
    const t = textOf(own);
    if (t && t.length < 80) return t;
  }
  const legend = el.closest("fieldset")?.querySelector(":scope > legend");
  if (legend && textOf(legend)) return textOf(legend);
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.trim();
  const by = el.getAttribute("aria-labelledby");
  if (by) {
    const t = by.split(/\s+/).map((x) => textOf(doc.getElementById(x))).join(" ").trim();
    if (t) return t;
  }
  // Yakındaki etiket benzeri öğe (alan grubunun başlığı)
  let cur: Element | null = el.parentElement;
  for (let d = 0; d < 4 && cur; d++) {
    if (cur.querySelectorAll("input:not([type=hidden]), textarea, select").length > 2) break;
    const lab = cur.querySelector("label, legend, [class*='label' i]");
    if (lab && !lab.contains(el)) {
      const t = textOf(lab);
      if (t && t.length < 60) return t;
    }
    cur = cur.parentElement;
  }
  return "";
}

function placeholderFor(el: Element): string {
  const p = el.getAttribute("placeholder");
  if (p) return p;
  const host = el.closest("[class*='-container'], .ant-select, .MuiAutocomplete-root");
  return textOf(host?.querySelector("[class*='placeholder' i]"));
}

function hintsOf(el: Control) {
  const type = el instanceof HTMLSelectElement
    ? "select"
    : el instanceof HTMLTextAreaElement
      ? "textarea"
      : isCombobox(el)
        ? "combobox"
        : el instanceof HTMLInputElement
          ? el.type
          : "text";
  return {
    label: labelFor(el),
    placeholder: placeholderFor(el),
    name: el.getAttribute("name") ?? "",
    id: el.id,
    autocomplete: el.getAttribute("autocomplete") ?? "",
    type,
  };
}

// ---- Kapsam ---------------------------------------------------------------

function scopeFor(target: Element | null, doc: Document): { root: ParentNode; label: string } {
  if (target) {
    const form = target.closest("form");
    if (form && collect(form).length > 0) return { root: form, label: "form" };
    const dialog = target.closest("dialog, [role=dialog], [aria-modal=true], .modal, .MuiDialog-root, .ant-modal");
    let cur: Element | null = target.parentElement;
    while (cur && cur !== doc.body) {
      if (collect(cur).length >= 3) return { root: cur, label: "alan grubu" };
      if (cur === dialog) return { root: cur, label: "diyalog" };
      cur = cur.parentElement;
    }
    if (dialog) return { root: dialog, label: "diyalog" };
  }
  const dialogs = Array.from(doc.querySelectorAll("dialog[open], [role=dialog], [aria-modal=true], .modal.show, .MuiDialog-root, .ant-modal"))
    .filter((d) => isVisible(d) && collect(d).length > 0);
  if (dialogs.length) return { root: dialogs[dialogs.length - 1], label: "diyalog" };
  const forms = Array.from(doc.forms).filter((f) => isVisible(f));
  if (forms.length) {
    const best = forms.sort((a, b) => collect(b).length - collect(a).length)[0];
    if (collect(best).length) return { root: best, label: "form" };
  }
  return { root: doc.body, label: "sayfa" };
}

// ---- Yazma ----------------------------------------------------------------

function nativeSetter(el: Element, prop: "value" | "checked"): ((v: unknown) => void) | null {
  let proto: object | null = Object.getPrototypeOf(el);
  while (proto) {
    const d = Object.getOwnPropertyDescriptor(proto, prop);
    if (d?.set) return (v: unknown) => d.set!.call(el, v);
    proto = Object.getPrototypeOf(proto);
  }
  return null;
}

function fire(el: Element, type: string) {
  el.dispatchEvent(new Event(type, { bubbles: true }));
}

function setValueDirect(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, v: string) {
  const set = nativeSetter(el, "value");
  if (set) set(v);
  else el.value = v;
  fire(el, "input");
  fire(el, "change");
}

function canSelectText(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLTextAreaElement) return true;
  return el instanceof HTMLInputElement && ["text", "search", "tel", "url", "password", ""].includes(el.type);
}

/** Kullanıcı yazıyormuş gibi: execCommand insertText (maske kütüphaneleri doğru işler). */
function typeInto(el: HTMLInputElement | HTMLTextAreaElement, text: string, charByChar: boolean) {
  const doc = el.ownerDocument;
  el.focus();
  if (canSelectText(el)) {
    el.select();
    if (el.value) doc.execCommand("delete");
    let ok = true;
    if (charByChar) {
      for (const ch of text) ok = doc.execCommand("insertText", false, ch) && ok;
    } else {
      ok = doc.execCommand("insertText", false, text);
    }
    if (ok && el.value) {
      fire(el, "change");
      return;
    }
  }
  setValueDirect(el, text);
}

function blurField(el: Element) {
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", code: "Tab", bubbles: true }));
  (el as HTMLElement).blur?.();
  fire(el, "blur");
}

function click(el: Element) {
  const r = el.getBoundingClientRect();
  const o = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
  el.dispatchEvent(new PointerEvent("pointerdown", o));
  el.dispatchEvent(new MouseEvent("mousedown", o));
  el.dispatchEvent(new PointerEvent("pointerup", o));
  el.dispatchEvent(new MouseEvent("mouseup", o));
  el.dispatchEvent(new MouseEvent("click", o));
}

// ---- Tarih ----------------------------------------------------------------

type DateFmt = "DD.MM.YYYY" | "DD/MM/YYYY" | "DD-MM-YYYY" | "YYYY-MM-DD" | "MM/DD/YYYY";
const DATE_FALLBACKS: DateFmt[] = ["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"];

function detectDateFormat(el: HTMLInputElement): DateFmt {
  const src = normalizeSpaces(`${el.placeholder} ${el.value} ${el.getAttribute("data-format") ?? ""}`).toLowerCase();
  if (/y{2,4}[-./]m{1,2}[-./]d{1,2}|^\d{4}-\d{2}-\d{2}/.test(src)) return "YYYY-MM-DD";
  if (/m{1,2}\/d{1,2}\/y/.test(src)) return "MM/DD/YYYY";
  let m = src.match(/(?:d{1,2}|g{1,2})([./-])(?:m{1,2}|a{1,2})/);
  if (m) return (`DD${m[1]}MM${m[1]}YYYY`) as DateFmt;
  m = src.match(/\d{1,2}([./-])\d{1,2}\1\d{4}/) ?? src.match(/_{2}([./-])_{2}\1_{4}/);
  if (m) return (`DD${m[1]}MM${m[1]}YYYY`) as DateFmt;
  return "DD.MM.YYYY";
}

function normalizeSpaces(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function formatDate(iso: string, fmt: DateFmt): string {
  const [y, m, d] = iso.split("-");
  switch (fmt) {
    case "YYYY-MM-DD": return iso;
    case "MM/DD/YYYY": return `${m}/${d}/${y}`;
    default: {
      const sep = fmt[2];
      return `${d}${sep}${m}${sep}${y}`;
    }
  }
}

function dateMatches(value: string, iso: string, fmt: DateFmt): boolean {
  const digits = value.replace(/\D/g, "");
  return digits === formatDate(iso, fmt).replace(/\D/g, "");
}

// ---- Telefon --------------------------------------------------------------

function isCountryCodeBox(el: Control): boolean {
  if (!(el instanceof HTMLInputElement)) return false;
  const v = (el.value || el.placeholder).trim();
  if (/^\+\d{1,3}$/.test(v)) return true;
  return el.maxLength > 0 && el.maxLength <= 4 && /\+/.test(v);
}

function hasCountryCodeSibling(el: Element): boolean {
  let cur: Element | null = el.parentElement;
  for (let d = 0; d < 3 && cur; d++) {
    const inputs = Array.from(cur.querySelectorAll("input:not([type=hidden])")) as HTMLInputElement[];
    if (inputs.length > 3) return false;
    if (inputs.some((i) => i !== el && isCountryCodeBox(i))) return true;
    cur = cur.parentElement;
  }
  return false;
}

/** Telefon için yazılacak metin: alanın maskesine / kardeş +90 kutusuna göre. */
function phoneText(el: HTMLInputElement, v: FieldValue): { text: string; charByChar: boolean } {
  const ten = v.phoneDigits ?? v.text.replace(/\D/g, "").replace(/^0/, "");
  const ph = el.placeholder.trim();
  const masked = /[_#]/.test(ph) || /mask/i.test(el.className) || el.hasAttribute("data-mask");
  if (hasCountryCodeSibling(el)) return { text: ten, charByChar: true };
  if (/^\+?90/.test(ph) || /^\+90/.test(el.value)) return { text: ten, charByChar: true };
  if (el.maxLength === 10) return { text: ten, charByChar: true };
  if (el.maxLength === 11 || /^0/.test(ph)) return { text: `0${ten}`, charByChar: masked };
  if (masked) return { text: /^\(?5/.test(ph) ? ten : `0${ten}`, charByChar: true };
  return { text: v.text, charByChar: false };
}

// ---- Liste seçimi ---------------------------------------------------------

function optionCandidates(input: Element): HTMLElement[] {
  const doc = input.ownerDocument;
  const ids = `${input.getAttribute("aria-controls") ?? ""} ${input.getAttribute("aria-owns") ?? ""}`.trim().split(/\s+/).filter(Boolean);
  let roots: ParentNode[] = ids.map((id) => doc.getElementById(id)).filter(Boolean) as HTMLElement[];
  const host = input.closest("[class*='-container'], .MuiAutocomplete-root, .ant-select");
  const menu = host?.querySelector("[class*='-menu'], [role=listbox]");
  if (menu) roots.push(menu);
  if (!roots.length) {
    roots = Array.from(doc.querySelectorAll("[role=listbox], .ant-select-dropdown:not(.ant-select-dropdown-hidden), .MuiAutocomplete-popper, [class*='-menu']"))
      .filter((r) => isVisible(r) && !isOwnUi(r));
  }
  const sel = "[role=option], [id*='-option-'], .ant-select-item-option, [class*='-option']";
  const seen = new Set<Element>();
  const out: HTMLElement[] = [];
  for (const r of roots) {
    for (const o of Array.from(r.querySelectorAll(sel))) {
      if (seen.has(o)) continue;
      seen.add(o);
      const cls = String((o as HTMLElement).className ?? "");
      if (/no-?options|NoOptions|empty|disabled/i.test(cls)) continue;
      if (o.getAttribute("aria-disabled") === "true") continue;
      if (!isVisible(o)) continue;
      // iç içe seçenek kapsayıcılarında en içteki
      if (o.querySelector(sel)) continue;
      out.push(o as HTMLElement);
    }
  }
  return out.filter((o) => !PLACEHOLDER_OPTION_RE.test(normalizeTr(textOf(o))));
}

function bestMatch<T>(items: T[], text: (t: T) => string, hints: string[] = []): T | null {
  for (const h of hints) {
    const n = normalizeTr(h);
    if (!n) continue;
    const exact = items.find((i) => normalizeTr(text(i)) === n);
    if (exact) return exact;
    const starts = items.find((i) => normalizeTr(text(i)).startsWith(n));
    if (starts) return starts;
    const inc = items.find((i) => normalizeTr(text(i)).includes(n));
    if (inc) return inc;
  }
  return null;
}

function comboShownText(input: Element): string {
  const host = input.closest("[class*='-container'], .MuiAutocomplete-root, .ant-select") ?? input.parentElement;
  const single = host?.querySelector("[class*='singleValue'], [class*='single-value'], .ant-select-selection-item, [class*='multiValue']");
  if (single) return textOf(single);
  if (input instanceof HTMLInputElement && input.value) return input.value;
  const hidden = host?.querySelector("input[type=hidden]") as HTMLInputElement | null;
  return hidden?.value ?? "";
}

async function openCombobox(input: HTMLElement): Promise<HTMLElement[]> {
  const control =
    input.closest("[class*='-control'], .ant-select-selector, .MuiAutocomplete-inputRoot, .MuiInputBase-root") ?? input;
  input.focus();
  click(control as Element);
  let opts = await waitFor(() => { const o = optionCandidates(input); return o.length ? o : null; }, 400);
  if (!opts) {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", code: "ArrowDown", keyCode: 40, bubbles: true }));
    opts = await waitFor(() => { const o = optionCandidates(input); return o.length ? o : null; }, 900);
  }
  return opts ?? [];
}

async function pickFromCombobox(input: HTMLElement, hints: string[] | undefined): Promise<string | null> {
  let opts = await openCombobox(input);
  let choice = bestMatch(opts, textOf, hints);
  const searchable = input instanceof HTMLInputElement && !input.readOnly;
  if (!choice && hints?.length && searchable) {
    const inp = input as HTMLInputElement;
    inp.focus();
    input.ownerDocument.execCommand("insertText", false, hints[0]);
    const filtered = await waitFor(() => {
      const o = optionCandidates(input);
      return o.length ? o : null;
    }, 1200);
    opts = filtered ?? [];
    choice = bestMatch(opts, textOf, hints);
    if (!choice) {
      // Aranan yoksa yazılanı silip rastgele seç
      inp.select();
      input.ownerDocument.execCommand("delete");
      opts = await waitFor(() => { const o = optionCandidates(input); return o.length ? o : null; }, 900) ?? [];
    }
  }
  if (!choice && opts.length) choice = opts[Math.floor(Math.random() * Math.min(opts.length, 15))];
  if (!choice) {
    blurField(input);
    return null;
  }
  const label = textOf(choice);
  click(choice);
  await sleep(60);
  return label;
}

function pickNativeOption(sel: HTMLSelectElement, hints?: string[]): boolean {
  const valid = Array.from(sel.options).filter(
    (o) => !o.disabled && o.value !== "" && !PLACEHOLDER_OPTION_RE.test(normalizeTr(o.text)),
  );
  if (!valid.length) return false;
  const choice = bestMatch(valid, (o) => o.text, hints) ?? valid[Math.floor(Math.random() * valid.length)];
  setValueDirect(sel, choice.value);
  return true;
}

// ---- Plan ve uygulama -----------------------------------------------------

function controlKind(el: Control): Planned["control"] {
  if (el instanceof HTMLSelectElement) return "select";
  if (isCombobox(el)) return "combobox";
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox") return "checkbox";
    if (el.type === "radio") return "radio";
    if (["date", "datetime-local", "month"].includes(el.type)) return "date";
    if (el.type === "time") return "time";
  }
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return "editable";
  return "text";
}

function plan(controls: Control[], ctx: FillContext): Planned[] {
  const out: Planned[] = [];
  const radioGroups = new Set<string>();
  for (const el of controls) {
    const h = hintsOf(el);
    const control = controlKind(el);
    if (control === "radio") {
      const name = (el as HTMLInputElement).name || labelFor(el);
      if (radioGroups.has(name)) continue;
      radioGroups.add(name);
      const groupLabel = textOf(el.closest("fieldset")?.querySelector("legend")) || textOf(el.closest("[role=radiogroup]")?.previousElementSibling) || h.label;
      const kind = classifyField({ ...h, label: groupLabel });
      out.push({ el, kind, label: groupLabel || "Seçenek", control, value: valueFor(kind, ctx, groupLabel) });
      continue;
    }
    let kind = classifyField(h);
    if (control === "text" && isCountryCodeBox(el)) kind = "countryCode";
    if (control === "date" && !isDateKind(kind)) kind = "date";
    if (control === "time") kind = "time";
    if (control === "checkbox") {
      out.push({ el, kind, label: h.label || h.name, control, value: null });
      continue;
    }
    out.push({ el, kind, label: h.label || h.placeholder || h.name || KIND_LABELS[kind], control, value: valueFor(kind, ctx, h.label) });
  }
  return out;
}

async function applyOne(p: Planned, undo: UndoEntry[]): Promise<"filled" | "skipped" | "unchanged"> {
  const el = p.el;
  switch (p.control) {
    case "checkbox": {
      const cb = el as HTMLInputElement;
      const n = normalizeTr(p.label);
      const want = cb.required || CONSENT_RE.test(n);
      if (!want || cb.checked) return "unchanged";
      undo.push({ el, type: "checked", prev: cb.checked });
      cb.click();
      return "filled";
    }
    case "radio": {
      const r = el as HTMLInputElement;
      const group = r.name
        ? (Array.from(r.ownerDocument.querySelectorAll(`input[type=radio][name="${CSS.escape(r.name)}"]`)) as HTMLInputElement[])
        : [r];
      if (group.some((g) => g.checked)) return "unchanged";
      const choice = bestMatch(group, (g) => labelFor(g) || g.value, p.value?.optionHints) ?? group[Math.floor(Math.random() * group.length)];
      undo.push({ el: choice, type: "checked", prev: false });
      choice.click();
      return "filled";
    }
    case "select": {
      if (!p.value && p.kind === "countryCode") return "skipped";
      const sel = el as HTMLSelectElement;
      undo.push({ el, type: "select", prev: sel.value });
      return pickNativeOption(sel, p.value?.optionHints ?? (p.value ? [p.value.text] : undefined)) ? "filled" : "skipped";
    }
    case "combobox": {
      if (p.kind === "countryCode") return "skipped";
      const hints = p.value?.optionHints ?? (p.value && p.kind !== "text" ? [p.value.text] : undefined);
      const picked = await pickFromCombobox(el as HTMLElement, hints);
      if (!picked) return "skipped";
      undo.push({ el, type: "combobox", prev: "" });
      return "filled";
    }
    case "date": {
      if (!p.value?.iso) return "skipped";
      const inp = el as HTMLInputElement;
      undo.push({ el, type: "value", prev: inp.value });
      const v = inp.type === "month" ? p.value.iso.slice(0, 7) : inp.type === "datetime-local" ? `${p.value.iso}T09:00` : p.value.iso;
      setValueDirect(inp, v);
      return "filled";
    }
    case "time": {
      const inp = el as HTMLInputElement;
      undo.push({ el, type: "value", prev: inp.value });
      if (inp.type === "time") setValueDirect(inp, "09:00");
      else typeInto(inp, "09:00", true);
      blurField(inp);
      return "filled";
    }
    case "editable": {
      if (!p.value) return "skipped";
      const ed = el as HTMLElement;
      undo.push({ el, type: "value", prev: ed.textContent ?? "" });
      ed.focus();
      const doc = ed.ownerDocument;
      doc.execCommand("selectAll");
      doc.execCommand("insertText", false, p.value.text);
      return "filled";
    }
    case "text": {
      if (!p.value) return "skipped";
      const inp = el as HTMLInputElement | HTMLTextAreaElement;
      undo.push({ el, type: "value", prev: inp.value });
      if (isDateKind(p.kind) && p.value.iso && inp instanceof HTMLInputElement) {
        await typeDate(inp, p.value.iso);
        return "filled";
      }
      let text = p.value.text;
      let charByChar = text.length <= 40 && !(inp instanceof HTMLTextAreaElement);
      if (inp instanceof HTMLInputElement) {
        if (["phone", "workPhone", "homePhone"].includes(p.kind)) ({ text, charByChar } = phoneText(inp, p.value));
        if (inp.type === "number" || inp.inputMode === "numeric") {
          if (p.value.number !== undefined) text = String(p.value.number);
          else if (/^[\d\s.,]+$/.test(text)) text = text.replace(/\D/g, "");
        }
        if (inp.maxLength > 0 && text.length > inp.maxLength && !charByChar) text = text.slice(0, inp.maxLength);
      }
      typeInto(inp, text, charByChar);
      blurField(inp);
      return "filled";
    }
  }
}

async function typeDate(inp: HTMLInputElement, iso: string) {
  const first = detectDateFormat(inp);
  const tries = [first, ...DATE_FALLBACKS.filter((f) => f !== first)];
  for (const fmt of tries) {
    typeInto(inp, formatDate(iso, fmt), true);
    blurField(inp);
    await sleep(80);
    if (dateMatches(inp.value, iso, fmt)) return;
    // Bazı tarih seçiciler değeri kendi biçimine çevirir; gün/ay/yıl duruyorsa kabul
    const [y, m, d] = iso.split("-");
    const digits = inp.value.replace(/\D/g, "");
    if (digits.includes(y) && digits.includes(d) && digits.includes(m)) return;
  }
}

function verify(planned: Planned[]): Planned[] {
  const bad: Planned[] = [];
  for (const p of planned) {
    if (!p.value) continue;
    const el = p.el;
    if (p.control === "combobox") {
      if (!comboShownText(el)) bad.push(p);
      continue;
    }
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) continue;
    if (p.control !== "text") continue;
    const got = el.value;
    if (!got) { bad.push(p); continue; }
    if (["phone", "workPhone", "homePhone"].includes(p.kind)) {
      const want = (p.value.phoneDigits ?? "").slice(-7);
      if (want && !got.replace(/\D/g, "").endsWith(want)) bad.push(p);
    }
  }
  return bad;
}

function mark(els: Element[], color: string, ms: number) {
  for (const el of els) {
    const h = el as HTMLElement;
    const target = (h.closest("[class*='-control'], .ant-select-selector, .MuiInputBase-root") as HTMLElement) ?? h;
    const prev = target.style.outline;
    target.style.outline = `2px solid ${color}`;
    target.style.outlineOffset = "1px";
    if (ms > 0) setTimeout(() => (target.style.outline = prev), ms);
  }
}

function clearMarks(els: Element[]) {
  for (const el of els) {
    const target = ((el as HTMLElement).closest("[class*='-control'], .ant-select-selector, .MuiInputBase-root") as HTMLElement) ?? (el as HTMLElement);
    target.style.outline = "";
  }
}

async function fill(planned: Planned[]): Promise<RunResult> {
  const undo: UndoEntry[] = [];
  let filled = 0;
  let skipped = 0;
  const done: Planned[] = [];
  for (const p of planned) {
    try {
      const r = await applyOne(p, undo);
      if (r === "filled") { filled++; done.push(p); }
      else if (r === "skipped") skipped++;
    } catch {
      skipped++;
    }
  }
  lastUndo = undo;
  await sleep(120);
  const bad = verify(done);
  mark(bad.map((b) => b.el), "#d99a00", 6000);
  return { acted: true, filled, skipped, mismatches: bad.map((b) => b.label) };
}

async function undoLast(): Promise<RunResult> {
  let restored = 0;
  let failed = 0;
  for (const u of lastUndo.reverse()) {
    try {
      if (u.type === "checked") {
        const cb = u.el as HTMLInputElement;
        if (cb.checked !== u.prev) cb.click();
        restored++;
      } else if (u.type === "select") {
        setValueDirect(u.el as HTMLSelectElement, String(u.prev));
        restored++;
      } else if (u.type === "combobox") {
        const host = u.el.closest("[class*='-container'], .MuiAutocomplete-root, .ant-select");
        const clear = host?.querySelector("[class*='clearIndicator'], .MuiAutocomplete-clearIndicator, .ant-select-clear") as HTMLElement | null;
        if (clear) { click(clear); restored++; } else failed++;
      } else if (u.el instanceof HTMLInputElement || u.el instanceof HTMLTextAreaElement) {
        if (canSelectText(u.el)) typeInto(u.el, String(u.prev), false);
        if (u.el.value !== u.prev) setValueDirect(u.el, String(u.prev));
        blurField(u.el);
        restored++;
      } else {
        (u.el as HTMLElement).textContent = String(u.prev);
        restored++;
      }
    } catch {
      failed++;
    }
  }
  lastUndo = [];
  return {
    acted: true,
    filled: restored,
    skipped: failed,
    mismatches: [],
    message: failed ? `${restored} alan geri alındı, ${failed} liste alanı geri alınamadı` : `${restored} alan geri alındı`,
  };
}

// ---- Sayfa içi arayüz (önizleme, bildirim) --------------------------------

function uiRoot(): ShadowRoot {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.style.cssText = "all: initial; position: fixed; z-index: 2147483647; top: 0; right: 0;";
    document.documentElement.appendChild(host);
    const root = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      .toast, .panel { font: 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1b1d21; text-align: left; }
      .toast { position: fixed; right: 16px; bottom: 16px; display: flex; gap: 12px; align-items: center;
        background: #1b1d21; color: #f4f4f1; border-radius: 8px; padding: 10px 14px; box-shadow: 0 6px 20px rgba(0,0,0,.25); max-width: 420px; }
      .toast button { all: unset; cursor: pointer; border: 1px solid #55554f; border-radius: 5px; padding: 3px 10px; font-size: 12px; }
      .panel { position: fixed; top: 16px; right: 16px; width: 340px; max-height: calc(100vh - 32px); display: flex; flex-direction: column;
        background: #fff; border: 1px solid #d9d9d3; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.18); overflow: hidden; }
      .head { padding: 12px 14px; border-bottom: 1px solid #ecece7; }
      .head b { display: block; font-size: 14px; }
      .head span { color: #55554f; font-size: 12px; }
      .rows { overflow: auto; flex: 1; }
      .row { display: flex; justify-content: space-between; gap: 10px; padding: 7px 14px; border-bottom: 1px solid #f1f1ec; }
      .row .l { color: #55554f; flex: 0 0 42%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .row .v { font-family: ui-monospace, Menlo, monospace; font-size: 12px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .row.skip .v { color: #8a5a00; }
      .foot { display: flex; gap: 8px; padding: 12px 14px; }
      .foot button { all: unset; cursor: pointer; text-align: center; border-radius: 7px; padding: 9px 12px; font-weight: 600; border: 1px solid #d9d9d3; }
      .foot .primary { flex: 1; background: #1f4fd1; color: #fff; border-color: #1f4fd1; }
    `;
    root.appendChild(style);
  }
  return host.shadowRoot!;
}

let toastTimer = 0;
function toast(message: string, withUndo = false) {
  const root = uiRoot();
  root.querySelector(".toast")?.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  const span = document.createElement("span");
  span.textContent = message;
  t.appendChild(span);
  if (withUndo) {
    const b = document.createElement("button");
    b.textContent = "Geri al";
    b.onclick = async () => {
      const r = await undoLast();
      toast(r.message ?? "Geri alındı");
      chrome.runtime.sendMessage({ type: "dh:lastFill", result: null }).catch(() => {});
    };
    t.appendChild(b);
  }
  root.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.remove(), 6000);
}

function resultMessage(r: RunResult): string {
  let m = `${r.filled} alan dolduruldu`;
  if (r.skipped) m += ` · ${r.skipped} atlandı`;
  if (r.mismatches.length) m += ` · ${r.mismatches.length} alan tutmadı (sarı)`;
  return m;
}

const CONTROL_GROUP: Record<Planned["control"], string> = {
  text: "Metin ve sayı", editable: "Metin ve sayı", select: "Açılır liste", combobox: "Açılır liste",
  date: "Tarih", time: "Saat", checkbox: "Onay kutusu / seçenek", radio: "Onay kutusu / seçenek",
};

function previewValue(p: Planned): string {
  if (p.control === "checkbox") return CONSENT_RE.test(normalizeTr(p.label)) ? "işaretlenecek" : "dokunulmayacak";
  if (!p.value) return p.kind === "countryCode" ? "atlanacak (ülke kodu)" : "atlanacak";
  if (p.control === "combobox" || p.control === "select") return p.value.optionHints?.[0] ?? "listeden seçilecek";
  if (p.control === "radio") return p.value.optionHints?.[0] ?? "biri seçilecek";
  return p.value.text;
}

function showPreview(planned: Planned[], scopeLabel: string, ctx: FillContext): Promise<RunResult> {
  return new Promise((resolve) => {
    const root = uiRoot();
    root.querySelector(".panel")?.remove();
    const els = planned.map((p) => p.el);
    mark(els, "#1f4fd1", 0);
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Doldurma önizlemesi");
    const head = document.createElement("div");
    head.className = "head";
    const b = document.createElement("b");
    b.textContent = `Data Helper · ${planned.length} alan (${scopeLabel})`;
    const s = document.createElement("span");
    const counts: Record<string, number> = {};
    planned.forEach((p) => (counts[CONTROL_GROUP[p.control]] = (counts[CONTROL_GROUP[p.control]] ?? 0) + 1));
    s.textContent = `${ctx.persona.fullName} · ` + Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(" · ");
    head.append(b, s);
    const rows = document.createElement("div");
    rows.className = "rows";
    for (const p of planned) {
      const r = document.createElement("div");
      const v = previewValue(p);
      r.className = "row" + (/atlanacak|dokunulmayacak/.test(v) ? " skip" : "");
      const l = document.createElement("span");
      l.className = "l";
      l.textContent = p.label;
      const vv = document.createElement("span");
      vv.className = "v";
      vv.textContent = v;
      r.append(l, vv);
      rows.appendChild(r);
    }
    const foot = document.createElement("div");
    foot.className = "foot";
    const apply = document.createElement("button");
    apply.className = "primary";
    apply.textContent = `Uygula (${planned.filter((p) => p.value || p.control === "checkbox").length})`;
    const cancel = document.createElement("button");
    cancel.textContent = "İptal";
    foot.append(apply, cancel);
    panel.append(head, rows, foot);
    root.appendChild(panel);
    const close = () => { panel.remove(); clearMarks(els); };
    cancel.onclick = () => { close(); resolve({ acted: true, filled: 0, skipped: 0, mismatches: [], message: "Önizleme kapatıldı" }); };
    apply.onclick = async () => {
      close();
      const r = await fill(planned);
      toast(resultMessage(r), true);
      chrome.runtime.sendMessage({ type: "dh:lastFill", result: r }).catch(() => {});
      resolve(r);
    };
  });
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

// ---- Giriş noktası --------------------------------------------------------

function currentTarget(targeted: boolean): Element | null {
  const active = deepActive(document);
  const ctxTarget = lastContextTarget?.isConnected ? lastContextTarget : null;
  if (targeted) return ctxTarget ?? (active?.tagName === "IFRAME" ? null : active);
  if (active && active.tagName === "IFRAME") return null; // odak alt çerçevede
  return active ?? ctxTarget;
}

/**
 * Bu çerçeve işi yapmalı mı? Sağ tık menüsünde çerçeve bellidir. Kısayol ve
 * popup'ta: odak alt çerçevedeyse ana çerçeve çekilir, odaklı alt çerçeve yapar.
 */
function frameOwnsAction(args: RunArgs): boolean {
  if (args.targeted) return true;
  const active = deepActive(document);
  if (window === window.top) return active?.tagName !== "IFRAME";
  return !!active && active.tagName !== "IFRAME";
}

async function run(args: RunArgs): Promise<RunResult | null> {
  if (args.mode === "probe") return { acted: false, filled: 0, skipped: 0, mismatches: [] };
  if (!frameOwnsAction(args)) return null;
  const target = currentTarget(!!args.targeted);
  lastContextTarget = null;
  const ctx = args.ctx!;

  switch (args.mode) {
    case "copy": {
      const ok = await copyText(args.text ?? "");
      toast(ok ? "Panoya kopyalandı" : "Kopyalanamadı");
      return { acted: true, filled: 0, skipped: 0, mismatches: [] };
    }
    case "undo": {
      if (!lastUndo.length) {
        toast("Geri alınacak doldurma yok");
        return { acted: true, filled: 0, skipped: 0, mismatches: [], message: "Geri alınacak doldurma yok" };
      }
      const r = await undoLast();
      toast(r.message ?? "Geri alındı");
      return r;
    }
    case "form":
    case "preview": {
      const { root, label } = scopeFor(target, document);
      const planned = plan(collect(root), ctx);
      if (!planned.length) {
        toast("Doldurulacak alan bulunamadı");
        return { acted: true, filled: 0, skipped: 0, mismatches: [], message: "Alan bulunamadı" };
      }
      if (args.mode === "preview") return showPreview(planned, label, ctx);
      const r = await fill(planned);
      r.scopeLabel = label;
      toast(resultMessage(r), true);
      return r;
    }
    case "field":
    case "insert":
    case "option": {
      const el = resolveControl(target);
      if (!el) {
        toast("Önce doldurulacak alana tıklayın");
        return { acted: true, filled: 0, skipped: 0, mismatches: [], message: "Alan seçili değil" };
      }
      const [p] = plan([el], ctx);
      if (!p) return { acted: true, filled: 0, skipped: 1, mismatches: [] };
      if (args.mode === "insert") p.value = { text: args.text ?? "", optionHints: [args.text ?? ""] };
      if (args.mode === "option") p.value = { text: "", optionHints: [] };
      if (args.mode === "option" && p.control === "text") {
        toast("Bu alan bir liste değil");
        return { acted: true, filled: 0, skipped: 1, mismatches: [] };
      }
      if (args.mode === "option" && p.control === "checkbox") p.control = "radio";
      const r = await fill([p]);
      toast(r.filled ? `${KIND_LABELS[p.kind]} dolduruldu` : "Alan doldurulamadı", r.filled > 0);
      return r;
    }
  }
  return null;
}

if (!window.__dataHelper || window.__dataHelper.version < VERSION) {
  document.addEventListener("contextmenu", (e) => {
    lastContextTarget = (e.composedPath()[0] as Element) ?? (e.target as Element);
  }, true);
  window.__dataHelper = { run, version: VERSION };
}
