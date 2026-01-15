// Veri tipleri
export type DataType =
  | "tckn"
  | "vkn"
  | "smmm"
  | "iban"
  | "sgk"
  | "phone"
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "username"
  | "birthDate"
  | "address"
  | "text";

// Kategori tipleri
export type Category =
  | "personal"
  | "company"
  | "address"
  | "financial"
  | "other";

// Generator seçenekleri - Text Generator ve ilerideki fazlar için
export interface GeneratorOptions {
  length?: number;
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
  caseType?: "mixed" | "upper" | "lower";
}

// Veri öğesi tanımı
export interface DataItem {
  id: string;
  type: DataType;
  label: string;
  category: Category;
  isLongText?: boolean;
  generator: (options?: GeneratorOptions) => string;
}

// Favori öğesi
export interface FavoriteItem {
  id: string;
  order: number;
  addedAt: number;
}

// Storage anahtarları
export const STORAGE_KEYS = {
  FAVORITES: "favorites",
  SETTINGS: "settings",
  SESSION_DATA: "sessionData",
} as const;

// Varsayılan ayarlar
export const DEFAULT_TEXT_OPTIONS: GeneratorOptions = {
  length: 50,
  includeNumbers: false,
  includeSpecialChars: false,
  caseType: "mixed",
};
