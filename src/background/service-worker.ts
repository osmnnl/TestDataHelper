/**
 * Background service worker.
 * - Sağ tık menüsünü bir kez kurar (removeAll → create, yarış korumalı).
 * - Doldurma motorunu (engine.js) sekmeye yükleyip çalıştırır.
 * - Geçerli persona / şirket / kilit durumunu ve son doldurma özetini tutar.
 */

import { generatePersona, generateCompany, generateText, type Persona, type Company } from "../generators";
import { CATALOG, TABS, catalogItem } from "../shared/catalog";
import type { FillContext } from "../shared/values";
import type { RunArgs, RunMode, RunResult } from "../content/engine";
import { appendHistory } from "../storage/history";
import { getSettings } from "../storage/favorites";

const ENGINE_FILE = "engine.js";
const K = {
  persona: "dh.persona",
  company: "dh.company",
  locked: "dh.locked",
  used: "dh.used",
  lastFill: "dh.lastFill",
} as const;

// ---- Durum ----------------------------------------------------------------

export interface HelperState {
  persona: Persona;
  company: Company;
  locked: boolean;
}

async function getState(): Promise<HelperState> {
  const s = await chrome.storage.local.get([K.persona, K.company, K.locked]);
  let persona = s[K.persona] as Persona | undefined;
  let company = s[K.company] as Company | undefined;
  // 1.x persona'sında yeni alanlar yok → yenile
  if (!persona?.dates) persona = generatePersona();
  if (!company?.vkn) company = generateCompany();
  if (s[K.persona] !== persona || s[K.company] !== company) {
    await chrome.storage.local.set({ [K.persona]: persona, [K.company]: company });
  }
  return { persona, company, locked: !!s[K.locked] };
}

async function regenerate(what: "persona" | "company" | "both"): Promise<HelperState> {
  const patch: Record<string, unknown> = {};
  if (what !== "company") patch[K.persona] = generatePersona();
  if (what !== "persona") patch[K.company] = generateCompany();
  if (what !== "company") patch[K.used] = false;
  await chrome.storage.local.set(patch);
  const st = await getState();
  updatePersonaMenuTitle(st.persona);
  return st;
}

async function setLastFill(tabId: number, result: RunResult | null) {
  await chrome.storage.session.set({ [`${K.lastFill}.${tabId}`]: result ? { ...result, ts: Date.now() } : null });
}

// ---- Engellenen alan adları -------------------------------------------------

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
    const list = (await getSettings()).blockedDomains ?? [];
    return list.some((pattern) => hostMatches(hostname, pattern));
  } catch {
    return false;
  }
}

// ---- Motoru çalıştırma -----------------------------------------------------

export interface RunRequest {
  tabId: number;
  mode: RunMode;
  frameId?: number;
  text?: string;
}

async function runInTab(req: RunRequest): Promise<RunResult | { error: string }> {
  const tab = await chrome.tabs.get(req.tabId).catch(() => undefined);
  if (await isBlockedUrl(tab?.url)) return { error: "Bu alan adı ayarlarda engelli" };
  // Kilitli değilse: önceki doldurmada kullanılan kişi yerine yenisi
  if (req.mode === "form" || req.mode === "preview") {
    const { [K.used]: used, [K.locked]: locked } = await chrome.storage.local.get([K.used, K.locked]);
    if (used && !locked) await regenerate("persona");
  }
  const st = await getState();
  const target: chrome.scripting.InjectionTarget =
    req.frameId !== undefined
      ? { tabId: req.tabId, frameIds: [req.frameId] }
      : { tabId: req.tabId, allFrames: true };
  try {
    await chrome.scripting.executeScript({ target, files: [ENGINE_FILE] });
  } catch (e) {
    // Alt çerçevelerden biri erişilemezse yalnız ana çerçeveyi dene
    if (req.frameId !== undefined) return { error: String((e as Error).message ?? e) };
    try {
      await chrome.scripting.executeScript({ target: { tabId: req.tabId }, files: [ENGINE_FILE] });
    } catch (e2) {
      return { error: String((e2 as Error).message ?? e2) };
    }
  }
  const args: RunArgs = {
    mode: req.mode,
    ctx: { persona: st.persona, company: st.company } satisfies FillContext,
    text: req.text,
    targeted: req.frameId !== undefined,
  };
  let results: chrome.scripting.InjectionResult<RunResult | null>[];
  try {
    results = (await chrome.scripting.executeScript({
      target,
      func: (a: RunArgs) => window.__dataHelper?.run(a) ?? null,
      args: [args],
    })) as chrome.scripting.InjectionResult<RunResult | null>[];
  } catch (e) {
    return { error: String((e as Error).message ?? e) };
  }
  const result = results.map((r) => r.result).find((r): r is RunResult => !!r && r.acted);
  if (!result) return { error: "Sayfada işlem yapılamadı" };
  if ((req.mode === "form" || req.mode === "field") && result.filled > 0) {
    await setLastFill(req.tabId, result);
    if (req.mode === "form") await chrome.storage.local.set({ [K.used]: true });
  }
  if (req.mode === "undo") await setLastFill(req.tabId, null);
  return result;
}

// ---- Sağ tık menüsü ------------------------------------------------------

const ROOT = "dh";
let menuBuild: Promise<void> | null = null;

function create(props: chrome.contextMenus.CreateProperties): Promise<void> {
  return new Promise((resolve) => chrome.contextMenus.create({ contexts: ["all"], ...props }, () => {
    void chrome.runtime.lastError;
    resolve();
  }));
}

const TEXT_ITEMS = [
  { id: "text50", label: "50 karakter", len: 50 },
  { id: "text100", label: "100 karakter", len: 100 },
  { id: "text250", label: "250 karakter", len: 250 },
  { id: "text500", label: "500 karakter", len: 500 },
];

const COPY_ITEMS = ["tckn", "vkn", "iban", "phone", "email", "fullName"];

async function buildMenus(): Promise<void> {
  await new Promise<void>((r) => chrome.contextMenus.removeAll(() => r()));
  const isMac = navigator.userAgent.includes("Mac");
  const formKey = isMac ? "⌘⇧F" : "Ctrl+Shift+F";
  const fieldKey = isMac ? "⌥⇧F" : "Alt+Shift+F";
  await create({ id: ROOT, title: "Data Helper" });
  await create({ id: "fill-field", parentId: ROOT, title: `Bu alanı doldur\t${fieldKey}` });
  await create({ id: "fill-form", parentId: ROOT, title: `Bu formu doldur\t${formKey}` });
  await create({ id: "fill-preview", parentId: ROOT, title: "Önizleyerek doldur…" });
  await create({ id: "undo", parentId: ROOT, title: "Son doldurmayı geri al" });
  await create({ id: "sep1", parentId: ROOT, type: "separator" });
  await create({ id: "insert", parentId: ROOT, title: "Alana ekle" });
  for (const t of TABS) {
    await create({ id: `insert-tab-${t.id}`, parentId: "insert", title: t.label });
    if (t.id === "text") {
      for (const x of TEXT_ITEMS) await create({ id: `insert-${x.id}`, parentId: `insert-tab-${t.id}`, title: x.label });
      continue;
    }
    for (const item of CATALOG.filter((c) => c.tab === t.id)) {
      await create({ id: `insert-${item.id}`, parentId: `insert-tab-${t.id}`, title: item.label });
    }
  }
  await create({ id: "pick-option", parentId: ROOT, title: "Listeden seçenek seç" });
  await create({ id: "sep2", parentId: ROOT, type: "separator" });
  const st = await getState();
  await create({ id: "persona", parentId: ROOT, title: personaTitle(st.persona) });
  await create({ id: "persona-new", parentId: "persona", title: "Yeni kişi üret" });
  await create({ id: "company-new", parentId: "persona", title: "Yeni şirket üret" });
  await create({ id: "persona-lock", parentId: "persona", title: "Kişiyi kilitle (her doldurmada aynı kalsın)", type: "checkbox", checked: st.locked });
  await create({ id: "copy", parentId: ROOT, title: "Panoya kopyala" });
  for (const id of COPY_ITEMS) {
    const item = catalogItem(id)!;
    await create({ id: `copy-${id}`, parentId: "copy", title: item.label });
  }
}

function ensureMenus(): Promise<void> {
  if (!menuBuild) menuBuild = buildMenus().finally(() => (menuBuild = null));
  return menuBuild;
}

function personaTitle(p: Persona): string {
  return `Persona: ${p.fullName}`;
}

function updatePersonaMenuTitle(p: Persona) {
  chrome.contextMenus.update("persona", { title: personaTitle(p) }, () => void chrome.runtime.lastError);
}

chrome.runtime.onInstalled.addListener(() => void ensureMenus());
chrome.runtime.onStartup.addListener(() => void ensureMenus());

async function notifyError(tabId: number, message: string) {
  chrome.action.setBadgeBackgroundColor({ color: "#8a2c12" });
  chrome.action.setBadgeText({ tabId, text: "!" });
  chrome.action.setTitle({ tabId, title: `Data Helper: ${message}` });
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), 4000);
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  const tabId = tab.id;
  const frameId = info.frameId ?? 0;
  const id = String(info.menuItemId);
  let res: RunResult | { error: string } | null = null;

  if (id === "fill-field") res = await runInTab({ tabId, frameId, mode: "field" });
  else if (id === "fill-form") res = await runInTab({ tabId, frameId, mode: "form" });
  else if (id === "fill-preview") res = await runInTab({ tabId, frameId, mode: "preview" });
  else if (id === "undo") res = await runInTab({ tabId, frameId, mode: "undo" });
  else if (id === "pick-option") res = await runInTab({ tabId, frameId, mode: "option" });
  else if (id === "persona-new") await regenerate("persona");
  else if (id === "company-new") await regenerate("company");
  else if (id === "persona-lock") await chrome.storage.local.set({ [K.locked]: !!info.checked });
  else if (id.startsWith("insert-")) {
    const key = id.slice("insert-".length);
    const textItem = TEXT_ITEMS.find((t) => t.id === key);
    const st = await getState();
    const item = catalogItem(key);
    const value = textItem ? generateText({ length: textItem.len }) : item?.get(st) ?? "";
    if (value) {
      res = await runInTab({ tabId, frameId, mode: "insert", text: value });
      void appendHistory({ label: textItem?.label ?? item?.label ?? key, value, ts: Date.now(), source: "contextMenu" });
    }
  } else if (id.startsWith("copy-")) {
    const st = await getState();
    const item = catalogItem(id.slice(5));
    if (item) {
      const value = item.get(st);
      res = await runInTab({ tabId, frameId, mode: "copy", text: value });
      void appendHistory({ label: item.label, value, ts: Date.now(), source: "contextMenu" });
    }
  }
  if (res && "error" in res) await notifyError(tabId, res.error);
});

// ---- Kısayollar -----------------------------------------------------------

chrome.commands.onCommand.addListener(async (command, tab) => {
  const tabId = tab?.id ?? (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
  if (!tabId) return;
  const mode: RunMode | null = command === "fill-form" ? "form" : command === "fill-field" ? "field" : null;
  if (!mode) return;
  const res = await runInTab({ tabId, mode });
  if ("error" in res) await notifyError(tabId, res.error);
});

// ---- Popup / yan panel mesajları -----------------------------------------

type Msg =
  | { type: "dh:state" }
  | { type: "dh:regenerate"; what: "persona" | "company" | "both" }
  | { type: "dh:lock"; locked: boolean }
  | { type: "dh:run"; req: RunRequest }
  | { type: "dh:getLastFill"; tabId: number }
  | { type: "dh:lastFill"; result: RunResult | null };

chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case "dh:state": return getState();
      case "dh:regenerate": return regenerate(msg.what);
      case "dh:lock":
        await chrome.storage.local.set({ [K.locked]: msg.locked });
        chrome.contextMenus.update("persona-lock", { checked: msg.locked }, () => void chrome.runtime.lastError);
        return getState();
      case "dh:run": return runInTab(msg.req);
      case "dh:getLastFill": {
        const key = `${K.lastFill}.${msg.tabId}`;
        return (await chrome.storage.session.get(key))[key] ?? null;
      }
      case "dh:lastFill":
        if (sender.tab?.id) await setLastFill(sender.tab.id, msg.result);
        if (msg.result?.filled) await chrome.storage.local.set({ [K.used]: true });
        return null;
    }
  })().then(sendResponse, (e) => sendResponse({ error: String(e) }));
  return true;
});

// Persona değişince menü başlığını güncelle (popup'tan yenilemede de)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[K.persona]?.newValue) updatePersonaMenuTitle(changes[K.persona].newValue as Persona);
  if (changes[K.locked]) {
    chrome.contextMenus.update("persona-lock", { checked: !!changes[K.locked].newValue }, () => void chrome.runtime.lastError);
  }
});

// Yan panel: eylem simgesi popup açar; yan panel popup'taki düğmeyle açılır.
chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {});

// Test ve hata ayıklama için
(globalThis as unknown as { dataHelper: unknown }).dataHelper = { runInTab, getState, regenerate, ensureMenus };
