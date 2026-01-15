/**
 * SGK Sicil Numarası Generator
 * Türkiye'de kullanılan SGK formatı
 */

/**
 * Rastgele SGK Sicil Numarası üret
 * Format: Genellikle 10-12 haneli rakam
 */
export function generateSGKNo(): string {
  // SGK numaraları genelde 10 haneli
  let sgkNo = "";
  for (let i = 0; i < 10; i++) {
    sgkNo += Math.floor(Math.random() * 10).toString();
  }
  return sgkNo;
}

/**
 * Formatlı SGK numarası (3-3-4 gruplu)
 */
export function generateFormattedSGKNo(): string {
  const sgkNo = generateSGKNo();
  return `${sgkNo.slice(0, 3)}-${sgkNo.slice(3, 6)}-${sgkNo.slice(6)}`;
}
