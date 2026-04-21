/**
 * İl plaka kodları (01-81) ve TR harf kalıpları.
 */

export const PLATE_CITY_CODES: readonly string[] = Array.from(
  { length: 81 },
  (_, i) => (i + 1).toString().padStart(2, "0"),
);

// Türk plaka harfleri (TDK alfabesi, bazıları nadir kullanılır ama hepsi geçerli)
export const PLATE_LETTERS = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");
