/**
 * Son üretilen değerlerin session bazlı geçmişi. chrome.storage.session kullanır
 * (tarayıcı kapanınca silinir). Test sırasında "az önce ne üretmiştim?"
 * sorusuna cevap verir.
 */

export interface HistoryEntry {
  label: string;
  value: string;
  ts: number;
  source: "popup" | "contextMenu" | "persona";
}

const KEY = "generationHistory";
const MAX_ENTRIES = 20;

async function getSession<T>(key: string): Promise<T | undefined> {
  try {
    const res = await chrome.storage.session.get(key);
    return res[key] as T | undefined;
  } catch {
    return undefined;
  }
}

async function setSession<T>(key: string, value: T): Promise<void> {
  try {
    await chrome.storage.session.set({ [key]: value });
  } catch {
    /* session API yoksa sessizce geç */
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  return (await getSession<HistoryEntry[]>(KEY)) ?? [];
}

export async function appendHistory(entry: HistoryEntry): Promise<void> {
  const current = await getHistory();
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  await setSession(KEY, next);
}

export async function clearHistory(): Promise<void> {
  await setSession(KEY, []);
}
