import { useCallback, useEffect, useState } from "react";
import { generatePersona, type Persona } from "../generators";
import "./SmartFillBar.css";

const STORAGE_KEY = "currentPersona";

/**
 * Side panel üstünde sabit, aktif sekmedeki formu persona ile doldurma butonu.
 * Service worker'daki aynı fillFormWithPersona fonksiyonunun klonu kullanılır;
 * DRY ideali için ileride paylaşılan bir utils modülüne çekilebilir.
 */
export function SmartFillBar() {
  const [status, setStatus] = useState<string | null>(null);

  const getPersona = useCallback(async (): Promise<Persona> => {
    try {
      const stored = await chrome.storage.session.get(STORAGE_KEY);
      if (stored[STORAGE_KEY]) return stored[STORAGE_KEY] as Persona;
    } catch {
      /* yut */
    }
    const fresh = generatePersona();
    try {
      await chrome.storage.session.set({ [STORAGE_KEY]: fresh });
    } catch {
      /* yut */
    }
    return fresh;
  }, []);

  const fillActiveTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        setStatus("Aktif sekme bulunamadı");
        return;
      }
      const persona = await getPersona();
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fillFormWithPersona,
        args: [persona],
      });
      const filled = (result?.result as number | undefined) ?? 0;
      setStatus(
        filled > 0 ? `✓ ${filled} alan dolduruldu` : "Uygun alan bulunamadı",
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Hata");
    }
  };

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <div className="smart-fill-bar">
      <button type="button" onClick={fillActiveTab} className="smart-fill-btn">
        ⚡ Bu sekmedeki formu persona ile doldur
      </button>
      {status && <div className="smart-fill-status">{status}</div>}
    </div>
  );
}

/**
 * Page context'te çalışır. Service worker'daki `fillFormWithPersona` ile senkron
 * tutulmalı — davranış değişirse her iki yer de güncellenmelidir.
 */
function fillFormWithPersona(persona: Persona): number {
  const setValueReact = (
    el: HTMLInputElement | HTMLTextAreaElement,
    v: string,
  ) => {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const getLabelText = (el: Element): string => {
    const id = el.id;
    if (id) {
      try {
        const lbl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (lbl) return (lbl.textContent ?? "").trim();
      } catch {
        /* noop */
      }
    }
    const parentLabel = el.closest("label");
    if (parentLabel) return (parentLabel.textContent ?? "").trim();
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const refs = labelledBy
        .split(/\s+/)
        .map((x) => document.getElementById(x)?.textContent ?? "")
        .join(" ")
        .trim();
      if (refs) return refs;
    }
    let current: Element | null = el.parentElement;
    for (let d = 0; d < 5 && current; d++) {
      const labelLike = current.querySelector(
        "label, legend, [class*='label' i], [class*='title' i]",
      );
      if (labelLike && !labelLike.contains(el)) {
        const text = (labelLike.textContent ?? "").trim();
        if (text && text.length < 60) return text;
      }
      current = current.parentElement;
    }
    return "";
  };

  const pickPersonaField = (hint: string, type: string): string | null => {
    const h = hint.toLowerCase();
    if (type === "email" && !/kep/.test(h)) return persona.email;
    if (type === "tel" || type === "phone") return persona.phone;
    if (type === "date") {
      const m = persona.birthDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      return m ? `${m[3]}-${m[2]}-${m[1]}` : persona.birthDate;
    }
    if (/\b(tckn|tc\s*kimlik|tc\s*no|identity|national\s*id)\b/.test(h))
      return persona.tckn;
    if (/\b(kep)\b/.test(h)) return persona.kepEmail;
    if (/\b(mail|e-?posta|email)\b/.test(h)) return persona.email;
    if (/\b(kullan[ıi]c[ıi]|user(name)?|login)\b/.test(h)) return persona.username;
    if (/\b(ad[ıi]?\s*soyad|full\s*name|isim\s*soyisim)\b/.test(h))
      return persona.fullName;
    if (/\b(soyad|last\s*name|surname|family\s*name)\b/.test(h))
      return persona.lastName;
    if (/\b(ad|name|first\s*name|isim)\b/.test(h)) return persona.firstName;
    if (/\b(do[ğg]um|birth(day|date)?|dob)\b/.test(h)) return persona.birthDate;
    if (/\b(telefon|phone|gsm|cep|mobile)\b/.test(h)) return persona.phone;
    if (/\b(iban|hesap)\b/.test(h)) return persona.iban;
    if (/\b(card|kart(\s*no)?|kredi)\b/.test(h) && !/cvv|cvc|ccv/.test(h))
      return persona.creditCard;
    if (/\b(cvv|cvc|ccv|g[üu]venlik)\b/.test(h)) return persona.cvv;
    if (/\b(son\s*kullan|expiry|expiration|mm\/?yy)\b/.test(h))
      return persona.cardExpiry;
    if (/\b(posta\s*kod|postal|zip)\b/.test(h)) return persona.postalCode;
    if (/\b(plaka|plate|vehicle)\b/.test(h)) return persona.plate;
    if (/\b(pasaport|passport)\b/.test(h)) return persona.passport;
    if (/\b(bina\s*no|building|house\s*no)\b/.test(h)) return persona.buildingNo;
    if (/\b(daire(\s*no)?|apartment|flat|apt)\b/.test(h)) return persona.apartmentNo;
    if (/\b(cadde|street|avenue)\b/.test(h)) return persona.street;
    if (/\b(sokak)\b/.test(h)) return persona.street;
    if (/\b(mahalle|neighborhood)\b/.test(h)) return persona.neighborhood;
    if (/\b(il[çc]e|district)\b/.test(h)) return persona.district;
    if (/\b(ülke|ulke|country)\b/.test(h)) return persona.country;
    if (/\b(şehir|sehir|city|province)\b/.test(h)) return persona.city;
    if (/\b(vd|v\.d|vergi\s*dairesi)\b/.test(h)) return persona.city;
    if (/\b(adres|address)\b/.test(h)) return persona.address;
    return null;
  };

  const fillable = new Set([
    "text",
    "email",
    "tel",
    "phone",
    "number",
    "search",
    "url",
    "date",
    "",
  ]);

  let filled = 0;
  const isComponentInternalInput = (el: Element): boolean => {
    const inCustom = el.closest(
      "[class*='react-select'], [class*='select__'], [class*='Select__'], [class*='-autocomplete'], [role='combobox']",
    );
    if (!inCustom) return false;
    const hasLabel =
      el.id ||
      (el as HTMLInputElement).name ||
      el.getAttribute("aria-label");
    return !hasLabel;
  };

  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select",
    )
    .forEach((el) => {
      if (el instanceof HTMLInputElement) {
        if (el.disabled || el.readOnly) return;
        if (!fillable.has(el.type)) return;
      }
      if (el instanceof HTMLTextAreaElement && (el.disabled || el.readOnly))
        return;
      if (el instanceof HTMLSelectElement && el.disabled) return;
      if (isComponentInternalInput(el)) return;

      const hint = [
        el.name,
        el.id,
        el.getAttribute("placeholder") ?? "",
        getLabelText(el),
        el.getAttribute("autocomplete") ?? "",
      ]
        .filter(Boolean)
        .join(" ");

      const value = pickPersonaField(
        hint,
        el instanceof HTMLInputElement ? el.type : "",
      );
      if (!value) return;

      if (el instanceof HTMLSelectElement) {
        const opt = Array.from(el.options).find((o) =>
          o.text.toLowerCase().includes(value.toLowerCase()),
        );
        if (opt) {
          el.value = opt.value;
          el.dispatchEvent(new Event("change", { bubbles: true }));
          filled += 1;
        }
        return;
      }
      setValueReact(el, value);
      filled += 1;
    });
  return filled;
}
