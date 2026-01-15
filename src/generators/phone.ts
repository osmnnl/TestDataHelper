/**
 * Türk GSM Telefon Numarası Generator
 * Format: 05XX XXX XX XX
 */

// Türk mobil operatör önekleri
const GSM_PREFIXES = [
  // Turkcell
  "530",
  "531",
  "532",
  "533",
  "534",
  "535",
  "536",
  "537",
  "538",
  "539",
  // Vodafone
  "540",
  "541",
  "542",
  "543",
  "544",
  "545",
  "546",
  "547",
  "548",
  "549",
  // Türk Telekom
  "500",
  "501",
  "502",
  "503",
  "504",
  "505",
  "506",
  "507",
  "508",
  "509",
  "550",
  "551",
  "552",
  "553",
  "554",
  "555",
  "556",
  "557",
  "558",
  "559",
];

export function generatePhone(): string {
  // Rastgele operatör öneki seç
  const prefix = GSM_PREFIXES[Math.floor(Math.random() * GSM_PREFIXES.length)];

  // 7 haneli numara oluştur
  let number = "";
  for (let i = 0; i < 7; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }

  return `0${prefix}${number}`;
}

/**
 * Telefon numarasını formatlanmış şekilde döndür
 */
export function formatPhone(phone: string): string {
  // 05XX XXX XX XX formatı
  return phone.replace(/^(\d{4})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
}
