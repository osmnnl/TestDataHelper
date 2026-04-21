/**
 * Storage Yönetimi
 * Favori ve ayarlar için sync-first, local fallback, browser dışı (dev) için
 * localStorage fallback.
 */

import type { FavoriteItem, GeneratorOptions } from "../types";
import { STORAGE_KEYS, DEFAULT_TEXT_OPTIONS } from "../types";

// Varsayılan favoriler
const DEFAULT_FAVORITES: FavoriteItem[] = [
  { id: "tckn", order: 0, addedAt: Date.now() },
  { id: "vkn", order: 1, addedAt: Date.now() },
  { id: "email", order: 2, addedAt: Date.now() },
  { id: "phone", order: 3, addedAt: Date.now() },
];

interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
}

/**
 * Sync-first adapter: önce chrome.storage.sync, sonra chrome.storage.local,
 * en son localStorage (dev ortamı). Bu sayede eklenti birden fazla cihazda
 * açıkken favoriler senkronize olur.
 */
const adapter: StorageAdapter = {
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const sync = await chrome.storage.sync.get(key);
      if (sync[key] !== undefined) return sync[key] as T;
      const local = await chrome.storage.local.get(key);
      return local[key] as T | undefined;
    } catch {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : undefined;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    try {
      // sync başarısız olursa (quota) local'a düş
      try {
        await chrome.storage.sync.set({ [key]: value });
      } catch {
        await chrome.storage.local.set({ [key]: value });
      }
    } catch {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
};

export async function getFavorites(): Promise<FavoriteItem[]> {
  const favorites = await adapter.get<FavoriteItem[]>(STORAGE_KEYS.FAVORITES);
  return favorites ?? DEFAULT_FAVORITES;
}

export async function setFavorites(favorites: FavoriteItem[]): Promise<void> {
  await adapter.set(STORAGE_KEYS.FAVORITES, favorites);
}

export async function addFavorite(id: string): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();
  if (favorites.some((f) => f.id === id)) return favorites;

  const newFavorite: FavoriteItem = {
    id,
    order: favorites.length,
    addedAt: Date.now(),
  };
  const updated = [...favorites, newFavorite];
  await setFavorites(updated);
  return updated;
}

export async function removeFavorite(id: string): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();
  const updated = favorites
    .filter((f) => f.id !== id)
    .map((f, index) => ({ ...f, order: index }));
  await setFavorites(updated);
  return updated;
}

export async function reorderFavorites(
  orderedIds: string[],
): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();
  const byId = new Map(favorites.map((f) => [f.id, f]));
  const updated: FavoriteItem[] = [];
  orderedIds.forEach((id, index) => {
    const existing = byId.get(id);
    if (existing) updated.push({ ...existing, order: index });
  });
  // Listede olmayan favorileri sona ekle (güvenlik)
  favorites.forEach((f) => {
    if (!orderedIds.includes(f.id)) {
      updated.push({ ...f, order: updated.length });
    }
  });
  await setFavorites(updated);
  return updated;
}

export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === id);
}

// Settings
export interface Settings {
  textOptions: GeneratorOptions;
  preferredBankCode?: string;
  theme?: "auto" | "light" | "dark";
  /**
   * Host patternleri ("banka.com.tr", "*.example.com"). Bu domainlerde
   * Data Helper context menüsü sessizce yoksayılır.
   */
  blockedDomains?: string[];
}

const DEFAULT_SETTINGS: Settings = {
  textOptions: DEFAULT_TEXT_OPTIONS,
  theme: "auto",
  blockedDomains: [],
};

export async function getSettings(): Promise<Settings> {
  const stored = await adapter.get<Partial<Settings>>(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function setSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await adapter.set(STORAGE_KEYS.SETTINGS, updated);
}

/**
 * Favorileri + ayarları JSON olarak dışa aktar (backup / paylaşım).
 */
export async function exportAll(): Promise<string> {
  const [favorites, settings] = await Promise.all([
    getFavorites(),
    getSettings(),
  ]);
  return JSON.stringify(
    { version: 1, exportedAt: Date.now(), favorites, settings },
    null,
    2,
  );
}

interface ExportPayload {
  version?: number;
  favorites?: FavoriteItem[];
  settings?: Partial<Settings>;
}

/**
 * JSON backup'tan favori + ayarları içe aktar. Hatalı payload'da throw eder.
 */
export async function importAll(json: string): Promise<void> {
  const payload = JSON.parse(json) as ExportPayload;
  if (Array.isArray(payload.favorites)) {
    await setFavorites(payload.favorites);
  }
  if (payload.settings && typeof payload.settings === "object") {
    await setSettings(payload.settings);
  }
}
