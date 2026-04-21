/**
 * Background Service Worker
 * Context menü oluşturur ve seçilen veriyi aktif sekmenin hedef elementine
 * `chrome.scripting.executeScript` ile yazar. Kalıcı content-script yok.
 */

import { DATA_ITEMS_CONFIG, type DataItemConfig } from "./data-config";
import { generatePersona, type Persona } from "../generators";
import { appendHistory } from "../storage/history";
import { getSettings } from "../storage/favorites";

/**
 * Basit glob: `*.example.com` veya `example.com` şeklinde pattern'leri URL
 * hostname'ine karşı eşler.
 */
function hostMatches(host: string, pattern: string): boolean {
  const p = pattern.trim().toLowerCase();
  if (!p) return false;
  const h = host.toLowerCase();
  if (p.startsWith("*.")) {
    const suffix = p.slice(2);
    return h === suffix || h.endsWith(`.${suffix}`);
  }
  return h === p || h.endsWith(`.${p}`);
}

async function isBlockedUrl(url?: string): Promise<boolean> {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    const settings = await getSettings();
    const list = settings.blockedDomains ?? [];
    return list.some((pattern) => hostMatches(hostname, pattern));
  } catch {
    return false;
  }
}

const CATEGORIES = [
  { id: "financial", title: "💳 Finansal" },
  { id: "personal", title: "👤 Kişisel" },
  { id: "text", title: "📝 Metin" },
] as const;

const PERSONA_FIELDS: ReadonlyArray<{
  id: string;
  label: string;
  get: (p: Persona) => string;
}> = [
  { id: "fullName", label: "Ad Soyad", get: (p) => p.fullName },
  { id: "firstName", label: "Ad", get: (p) => p.firstName },
  { id: "lastName", label: "Soyad", get: (p) => p.lastName },
  { id: "tckn", label: "TC Kimlik No", get: (p) => p.tckn },
  { id: "birthDate", label: "Doğum Tarihi", get: (p) => p.birthDate },
  { id: "email", label: "E-posta", get: (p) => p.email },
  { id: "kepEmail", label: "KEP E-posta", get: (p) => p.kepEmail },
  { id: "username", label: "Kullanıcı Adı", get: (p) => p.username },
  { id: "phone", label: "Telefon", get: (p) => p.phone },
  { id: "iban", label: "IBAN", get: (p) => p.iban },
  { id: "creditCard", label: "Kredi Kartı", get: (p) => p.creditCard },
  { id: "cvv", label: "CVV", get: (p) => p.cvv },
  { id: "cardExpiry", label: "Son Kullanma", get: (p) => p.cardExpiry },
  { id: "address", label: "Tam Adres", get: (p) => p.address },
  { id: "country", label: "Ülke", get: (p) => p.country },
  { id: "city", label: "İl", get: (p) => p.city },
  { id: "district", label: "İlçe", get: (p) => p.district },
  { id: "neighborhood", label: "Mahalle", get: (p) => p.neighborhood },
  { id: "street", label: "Cadde/Sokak", get: (p) => p.street },
  { id: "buildingNo", label: "Bina No", get: (p) => p.buildingNo },
  { id: "apartmentNo", label: "Daire No", get: (p) => p.apartmentNo },
  { id: "postalCode", label: "Posta Kodu", get: (p) => p.postalCode },
  { id: "plate", label: "Plaka", get: (p) => p.plate },
  { id: "passport", label: "Pasaport No", get: (p) => p.passport },
];

const PERSONA_STORAGE_KEY = "currentPersona";

async function getOrCreatePersona(): Promise<Persona> {
  const stored = await chrome.storage.session.get(PERSONA_STORAGE_KEY);
  if (stored[PERSONA_STORAGE_KEY]) return stored[PERSONA_STORAGE_KEY] as Persona;
  const fresh = generatePersona();
  await chrome.storage.session.set({ [PERSONA_STORAGE_KEY]: fresh });
  return fresh;
}

/**
 * SW tarafı hint → persona field eşleyicisi. `fillFormWithPersona` içindeki
 * mantığın aynısı; aynı kurallar iki bağlamda (page inline + SW) kullanılsın.
 */
function smartPickValue(
  hint: string,
  type: string,
  persona: Persona,
): string | null {
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
}

async function regeneratePersona(): Promise<Persona> {
  const fresh = generatePersona();
  await chrome.storage.session.set({ [PERSONA_STORAGE_KEY]: fresh });
  return fresh;
}

function createContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "data-helper-root",
      title: "Data Helper",
      contexts: ["all"],
    });

    CATEGORIES.forEach((category) => {
      chrome.contextMenus.create({
        id: `category-${category.id}`,
        parentId: "data-helper-root",
        title: category.title,
        contexts: ["all"],
      });
    });

    DATA_ITEMS_CONFIG.forEach((item: DataItemConfig) => {
      chrome.contextMenus.create({
        id: `generate-${item.id}`,
        parentId: `category-${item.category}`,
        title: item.label,
        contexts: ["all"],
      });
    });

    chrome.contextMenus.create({
      id: "select-random-option",
      parentId: "data-helper-root",
      title: "🎲 Rastgele seçenek (select)",
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      id: "fill-form-persona",
      parentId: "data-helper-root",
      title: "⚡ Bu formu persona ile doldur",
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      id: "smart-autofill",
      parentId: "data-helper-root",
      title: "📌 Akıllı: alanı otomatik doldur",
      contexts: ["all"],
    });

    // Persona (tutarlı kişi) alt menüsü
    chrome.contextMenus.create({
      id: "persona-root",
      parentId: "data-helper-root",
      title: "🧑 Persona (tutarlı kişi)",
      contexts: ["all"],
    });
    chrome.contextMenus.create({
      id: "persona-regenerate",
      parentId: "persona-root",
      title: "🔄 Yeni kişi üret",
      contexts: ["all"],
    });
    chrome.contextMenus.create({
      id: "persona-separator",
      parentId: "persona-root",
      type: "separator",
      contexts: ["all"],
    });
    PERSONA_FIELDS.forEach((field) => {
      chrome.contextMenus.create({
        id: `persona-${field.id}`,
        parentId: "persona-root",
        title: field.label,
        contexts: ["all"],
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.runtime.onStartup.addListener(createContextMenus);
// SW her spin-up'ta da yeniden oluştur: onInstalled bazı koşullarda
// yeniden tetiklenmeyebilir (Chrome versiyonuna/SW idle davranışına göre).
// `removeAll` idempotent, yan etkisi yok.
createContextMenus();
console.log("[Data Helper] Service worker booted; context menus registered.");

// Son üretilen değerin ilk 3 karakterini action ikonunda badge olarak göster.
function flashBadge(label: string): void {
  const text = label.slice(0, 3).toUpperCase();
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: "#4f46e5" });
  // 3 saniye sonra sil
  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, 3000);
}

/**
 * Aktif element'in tipini, name/id/label/placeholder hint'ini toplar. SW tarafı
 * bu hint'e göre uygun generator'ı seçer.
 */
function readActiveElementHint(): { hint: string; type: string } | null {
  const target = document.activeElement as HTMLElement | null;
  if (!target) return null;
  const getLabel = (el: Element): string => {
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
    const aria = el.getAttribute("aria-label");
    if (aria) return aria;
    // Ancestor fallback (floating label wrapper'ları için)
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
  const hint = [
    (target as HTMLInputElement).name ?? "",
    target.id ?? "",
    target.getAttribute("placeholder") ?? "",
    getLabel(target),
    target.getAttribute("autocomplete") ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const type = target instanceof HTMLInputElement ? target.type : "";
  return { hint, type };
}

/**
 * Sayfaya enjekte edilip çalıştırılır. Sağ-tık sonrası `document.activeElement`
 * tipik olarak hedef elementtir (Chrome input/select/textarea/contenteditable'ı
 * contextmenu'den önce focus eder).
 */
function fillTargetElement(value: string, selectRandomOption: boolean): void {
  const target = document.activeElement as HTMLElement | null;
  if (!target) return;

  const dispatch = (el: HTMLElement) => {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  if (target instanceof HTMLSelectElement) {
    const options = Array.from(target.options).filter(
      (o) => !o.disabled && o.value !== "",
    );
    if (options.length === 0) return;

    let chosen: HTMLOptionElement | undefined;
    if (!selectRandomOption && value) {
      chosen = options.find(
        (o) =>
          o.value === value ||
          o.text.toLowerCase().includes(value.toLowerCase()),
      );
    }
    if (!chosen) {
      chosen = options[Math.floor(Math.random() * options.length)];
    }
    target.value = chosen.value;
    dispatch(target);
    return;
  }

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const proto =
      target instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(target, value);
    else target.value = value;
    dispatch(target);
    target.focus();
    return;
  }

  if (target.isContentEditable) {
    target.textContent = value;
    dispatch(target);
    target.focus();
  }
}

/**
 * Sayfadaki formu persona alanlarıyla doldurur. `name/id/placeholder/label/
 * type`'a göre her alanı en uygun persona alanına eşler. Doldurulan eleman
 * sayısını döner.
 */
function fillFormWithPersona(persona: Persona): number {
  const setValueReact = (el: HTMLInputElement | HTMLTextAreaElement, v: string) => {
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
        /* geçersiz id */
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
    // Fallback: custom wrapper'larda (MUI floating label, react-select vb.)
    // <label for=""> yoktur. Ancestor'larda label/legend veya class'ında
    // "label"/"title" olan bir element aranır.
    let current: Element | null = el.parentElement;
    for (let depth = 0; depth < 5 && current; depth++) {
      const labelLike = current.querySelector(
        "label, legend, [class*='label' i], [class*='title' i]",
      );
      if (labelLike && !labelLike.contains(el)) {
        const text = (labelLike.textContent ?? "").trim();
        if (text && text.length > 0 && text.length < 60) return text;
      }
      current = current.parentElement;
    }
    return "";
  };

  const pickPersonaField = (
    hint: string,
    type: string,
  ): string | null => {
    const h = hint.toLowerCase();

    // Tip-öncelikli eşleme
    if (type === "email" && !/kep/.test(h)) return persona.email;
    if (type === "tel" || type === "phone") return persona.phone;
    if (type === "date") {
      // YYYY-MM-DD bekler
      const m = persona.birthDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      return m ? `${m[3]}-${m[2]}-${m[1]}` : persona.birthDate;
    }

    // İsim/ad bileşenleri
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
    // Granular adres parçaları — genel "adres" regex'inden ÖNCE
    if (/\b(bina\s*no|building|house\s*no)\b/.test(h)) return persona.buildingNo;
    if (/\b(daire(\s*no)?|apartment|flat|apt)\b/.test(h)) return persona.apartmentNo;
    if (/\b(cadde|street|avenue)\b/.test(h)) return persona.street;
    if (/\b(sokak)\b/.test(h)) return persona.street;
    if (/\b(mahalle|neighborhood)\b/.test(h)) return persona.neighborhood;
    if (/\b(il[çc]e|district)\b/.test(h)) return persona.district;
    if (/\b(ülke|ulke|country)\b/.test(h)) return persona.country;
    if (/\b(şehir|sehir|city|province)\b/.test(h)) return persona.city;
    if (/\b(vd|v\.d|vergi\s*dairesi)\b/.test(h)) return persona.city; // VD şehre göre
    if (/\b(adres|address)\b/.test(h)) return persona.address;

    return null;
  };

  const FILLABLE_INPUT_TYPES = new Set([
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
  const inputs = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");

  // react-select vb. kütüphanelerin iç hidden input'ları: value setter doğrudan
  // component state'ini güncellemez. Bunları atla — aksi halde persona değerini
  // "kaybettirmiş" olmuş oluruz.
  const isComponentInternalInput = (el: Element): boolean => {
    const inCustom = el.closest(
      "[class*='react-select'], [class*='select__'], [class*='Select__'], [class*='-autocomplete'], [role='combobox']",
    );
    if (!inCustom) return false;
    // Gerçek, etiketli input ise (nadir) devam et; aksi halde atla.
    const hasLabel =
      el.id ||
      (el as HTMLInputElement).name ||
      el.getAttribute("aria-label");
    return !hasLabel;
  };

  inputs.forEach((el) => {
    if (el instanceof HTMLInputElement) {
      if (el.disabled || el.readOnly) return;
      if (!FILLABLE_INPUT_TYPES.has(el.type)) return;
    }
    if (el instanceof HTMLTextAreaElement && (el.disabled || el.readOnly)) return;
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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (await isBlockedUrl(info.pageUrl)) {
    flashBadge("BLOK");
    return;
  }

  const menuId = info.menuItemId.toString();
  const frameTarget: chrome.scripting.InjectionTarget = {
    tabId: tab.id,
    frameIds: info.frameId !== undefined ? [info.frameId] : undefined,
  };

  if (menuId === "select-random-option") {
    chrome.scripting.executeScript({
      target: frameTarget,
      func: fillTargetElement,
      args: ["", true],
    });
    flashBadge("SEL");
    return;
  }

  if (menuId === "fill-form-persona") {
    const persona = await getOrCreatePersona();
    chrome.scripting.executeScript({
      target: frameTarget,
      func: fillFormWithPersona,
      args: [persona],
    });
    flashBadge("FORM");
    return;
  }

  if (menuId === "smart-autofill") {
    const [probe] = await chrome.scripting.executeScript({
      target: frameTarget,
      func: readActiveElementHint,
    });
    const result = probe?.result as
      | { hint: string; type: string }
      | null
      | undefined;
    if (!result) {
      flashBadge("?");
      return;
    }
    const persona = await getOrCreatePersona();
    const value = smartPickValue(result.hint, result.type, persona);
    if (!value) {
      flashBadge("?");
      return;
    }
    chrome.scripting.executeScript({
      target: frameTarget,
      func: fillTargetElement,
      args: [value, false],
    });
    flashBadge("AI");
    void appendHistory({
      label: "Akıllı",
      value,
      ts: Date.now(),
      source: "contextMenu",
    });
    return;
  }

  if (menuId === "persona-regenerate") {
    await regeneratePersona();
    flashBadge("NEW");
    return;
  }

  if (menuId.startsWith("persona-")) {
    const fieldId = menuId.replace("persona-", "");
    const field = PERSONA_FIELDS.find((f) => f.id === fieldId);
    if (!field) return;
    const persona = await getOrCreatePersona();
    const value = field.get(persona);
    chrome.scripting.executeScript({
      target: frameTarget,
      func: fillTargetElement,
      args: [value, false],
    });
    flashBadge(field.label);
    void appendHistory({
      label: field.label,
      value,
      ts: Date.now(),
      source: "persona",
    });
    return;
  }

  if (!menuId.startsWith("generate-")) return;

  const itemId = menuId.replace("generate-", "");
  const item = DATA_ITEMS_CONFIG.find((i) => i.id === itemId);
  if (!item) return;

  const generatedValue = item.generator();
  chrome.scripting.executeScript({
    target: frameTarget,
    func: fillTargetElement,
    args: [generatedValue, false],
  });
  flashBadge(item.label);
  void appendHistory({
    label: item.label,
    value: generatedValue,
    ts: Date.now(),
    source: "contextMenu",
  });
});
