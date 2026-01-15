/**
 * TC Kimlik No Generator
 * 11 haneli, Türkiye Cumhuriyeti kimlik numarası algoritmasına uygun
 *
 * Kurallar:
 * - 11 haneli olmalı
 * - İlk hane 0 olamaz
 * - 10. hane: ((1,3,5,7,9. haneler toplamı × 7) - (2,4,6,8. haneler toplamı)) mod 10
 * - 11. hane: (ilk 10 hane toplamı) mod 10
 */

export function generateTCKN(): string {
  // İlk 9 haneyi rastgele üret (ilk hane 0 olamaz)
  const digits: number[] = [];

  // İlk hane 1-9 arası
  digits.push(Math.floor(Math.random() * 9) + 1);

  // 2-9. haneler 0-9 arası
  for (let i = 1; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  // Tek pozisyondaki hanelerin toplamı (1, 3, 5, 7, 9. pozisyonlar - 0-indexed: 0, 2, 4, 6, 8)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];

  // Çift pozisyondaki hanelerin toplamı (2, 4, 6, 8. pozisyonlar - 0-indexed: 1, 3, 5, 7)
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  // 10. hane hesaplama
  let digit10 = (oddSum * 7 - evenSum) % 10;
  if (digit10 < 0) {
    digit10 += 10;
  }
  digits.push(digit10);

  // 11. hane hesaplama (ilk 10 hanenin toplamı mod 10)
  const sumFirst10 = digits.reduce((acc, curr) => acc + curr, 0);
  const digit11 = sumFirst10 % 10;
  digits.push(digit11);

  return digits.join("");
}

/**
 * TCKN doğrulama fonksiyonu (test amaçlı)
 */
export function validateTCKN(tckn: string): boolean {
  if (tckn.length !== 11) return false;
  if (!/^\d+$/.test(tckn)) return false;
  if (tckn[0] === "0") return false;

  const digits = tckn.split("").map(Number);

  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  let expectedDigit10 = (oddSum * 7 - evenSum) % 10;
  if (expectedDigit10 < 0) expectedDigit10 += 10;

  if (digits[9] !== expectedDigit10) return false;

  const sumFirst10 = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  const expectedDigit11 = sumFirst10 % 10;

  return digits[10] === expectedDigit11;
}
