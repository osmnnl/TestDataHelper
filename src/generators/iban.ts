import { rng } from "./random";

/**
 * Türk IBAN Generator
 * Format: TR + 2 kontrol hanesi + 5 banka kodu + 16 hesap no = 26 karakter
 *
 * IBAN kontrol hanesi hesaplaması:
 * 1. TR'yi 2927 olarak encode et (T=29, R=27)
 * 2. Banka kodu + Hesap no + 292700 birleştir
 * 3. Mod 97 al, 98'den çıkar = kontrol haneleri
 */

// Türk banka kodları
export const TR_BANKS: ReadonlyArray<{ code: string; name: string }> = [
  { code: "00010", name: "T.C. Ziraat Bankası" },
  { code: "00012", name: "Halkbank" },
  { code: "00015", name: "VakıfBank" },
  { code: "00032", name: "TEB" },
  { code: "00046", name: "Akbank" },
  { code: "00062", name: "Garanti BBVA" },
  { code: "00064", name: "İş Bankası" },
  { code: "00067", name: "Yapı Kredi" },
  { code: "00099", name: "ING" },
  { code: "00111", name: "HSBC" },
  { code: "00103", name: "Finansbank (QNB)" },
  { code: "00134", name: "DenizBank" },
  { code: "00143", name: "Odea Bank" },
  { code: "00205", name: "Kuveyt Türk" },
  { code: "00206", name: "Albaraka Türk" },
  { code: "00209", name: "Türkiye Finans" },
];

const BANK_CODES = TR_BANKS.map((b) => b.code);

function mod97(numStr: string): number {
  let checksum = 0;
  for (const char of numStr) {
    checksum = (checksum * 10 + parseInt(char, 10)) % 97;
  }
  return checksum;
}

export function generateIBAN(preferredBankCode?: string): string {
  const bankCode =
    preferredBankCode && BANK_CODES.includes(preferredBankCode)
      ? preferredBankCode
      : BANK_CODES[Math.floor(rng() * BANK_CODES.length)];

  // 16 haneli hesap numarası oluştur (0 ile başlayabilir)
  let accountNumber = "";
  for (let i = 0; i < 16; i++) {
    accountNumber += Math.floor(rng() * 10).toString();
  }

  // Kontrol hanesi hesaplama için string oluştur
  // Banka kodu + Hesap no + TR encode (2927) + 00
  const checkString = bankCode + accountNumber + "292700";

  // Kontrol hanesi hesapla
  const remainder = mod97(checkString);
  const checkDigits = (98 - remainder).toString().padStart(2, "0");

  // Final IBAN: TR + kontrol + banka + hesap
  return `TR${checkDigits}${bankCode}${accountNumber}`;
}

/**
 * IBAN'ı formatlanmış şekilde döndür (4'erli gruplar)
 */
export function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}