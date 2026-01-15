/**
 * Storage Yönetimi
 * chrome.storage.local ile favori ve ayar persistence
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

/**
 * Favorileri getir
 */
export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.FAVORITES);
    const favorites = result[STORAGE_KEYS.FAVORITES] as
      | FavoriteItem[]
      | undefined;
    return favorites ?? DEFAULT_FAVORITES;
  } catch {
    // Chrome API mevcut değilme (development)
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return stored ? (JSON.parse(stored) as FavoriteItem[]) : DEFAULT_FAVORITES;
  }
}

/**
 * Favorileri kaydet
 */
export async function setFavorites(favorites: FavoriteItem[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.FAVORITES]: favorites });
  } catch {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
}

/**
 * Favori ekle
 */
export async function addFavorite(id: string): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();

  // Zaten varsa ekleme
  if (favorites.some((f) => f.id === id)) {
    return favorites;
  }

  const newFavorite: FavoriteItem = {
    id,
    order: favorites.length,
    addedAt: Date.now(),
  };

  const updated = [...favorites, newFavorite];
  await setFavorites(updated);
  return updated;
}

/**
 * Favori kaldır
 */
export async function removeFavorite(id: string): Promise<FavoriteItem[]> {
  const favorites = await getFavorites();
  const updated = favorites
    .filter((f) => f.id !== id)
    .map((f, index) => ({ ...f, order: index }));

  await setFavorites(updated);
  return updated;
}

/**
 * Favori kontrolü
 */
export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === id);
}

// Settings

interface Settings {
  textOptions: GeneratorOptions;
}

const DEFAULT_SETTINGS: Settings = {
  textOptions: DEFAULT_TEXT_OPTIONS,
};

/**
 * Ayarları getir
 */
export async function getSettings(): Promise<Settings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const stored = result[STORAGE_KEYS.SETTINGS] as
      | Partial<Settings>
      | undefined;
    return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  } catch {
    const storedStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const stored = storedStr
      ? (JSON.parse(storedStr) as Partial<Settings>)
      : {};
    return { ...DEFAULT_SETTINGS, ...stored };
  }
}

/**
 * Ayarları kaydet
 */
export async function setSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };

  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
  } catch {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }
}
