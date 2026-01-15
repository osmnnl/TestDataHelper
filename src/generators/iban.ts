/**
 * Türk IBAN Generator
 * Format: TR + 2 kontrol hanesi + 5 banka kodu + 16 hesap no = 26 karakter
 *
 * IBAN kontrol hanesi hesaplaması:
 * 1. TR'yi 2927 olarak encode et (T=29, R=27)
 * 2. Banka kodu + Hesap no + 292700 birleştir
 * 3. Mod 97 al, 98'den çıkar = kontrol haneleri
 */

// Türk banka kodları (örnek)
const BANK_CODES = [
  "00010", // T.C. Ziraat Bankası
  "00012", // Halkbank
  "00015", // VakıfBank
  "00032", // TEB
  "00046", // Akbank
  "00062", // Garanti BBVA
  "00064", // İş Bankası
  "00067", // Yapı Kredi
  "00099", // ING
  "00111", // HSBC
];

function mod97(numStr: string): number {
  let checksum = 0;
  for (const char of numStr) {
    checksum = (checksum * 10 + parseInt(char, 10)) % 97;
  }
  return checksum;
}

export function generateIBAN(): string {
  // Rastgele banka kodu seç
  const bankCode = BANK_CODES[Math.floor(Math.random() * BANK_CODES.length)];

  // 16 haneli hesap numarası oluştur (0 ile başlayabilir)
  let accountNumber = "";
  for (let i = 0; i < 16; i++) {
    accountNumber += Math.floor(Math.random() * 10).toString();
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
