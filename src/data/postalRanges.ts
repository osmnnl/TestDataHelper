/**
 * TR posta kodu il prefixleri. Posta kodu 5 hane; ilk 2 hane plaka koduyla
 * aynı prefixtir (çoğunlukla). Tam doğruluk hedeflenmedi — test verisi.
 */

export const POSTAL_CODE_PREFIXES: readonly string[] = Array.from(
  { length: 81 },
  (_, i) => (i + 1).toString().padStart(2, "0"),
);
