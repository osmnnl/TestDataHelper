import { rng } from "./random";

/**
 * Kredi kartı / CVV / son kullanma üretici.
 * Luhn check digit ile geçerli görünen numara. Sadece test amaçlı.
 */

type CardBrand = "visa" | "mastercard" | "troy" | "amex";

const BIN_PREFIXES: Record<CardBrand, { prefixes: string[]; length: number }> = {
  visa: { prefixes: ["4"], length: 16 },
  mastercard: {
    prefixes: ["51", "52", "53", "54", "55", "2221", "2720"],
    length: 16,
  },
  troy: { prefixes: ["9792"], length: 16 },
  amex: { prefixes: ["34", "37"], length: 15 },
};

function luhnCheckDigit(partial: string): string {
  let sum = 0;
  let shouldDouble = true;
  for (let i = partial.length - 1; i >= 0; i--) {
    let digit = parseInt(partial[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return ((10 - (sum % 10)) % 10).toString();
}

function randomDigits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(rng() * 10).toString();
  return out;
}

export function generateCreditCard(brand: CardBrand = "visa"): string {
  const { prefixes, length } = BIN_PREFIXES[brand];
  const prefix = prefixes[Math.floor(rng() * prefixes.length)];
  const partial = prefix + randomDigits(length - 1 - prefix.length);
  const check = luhnCheckDigit(partial);
  return partial + check;
}

export function formatCreditCard(cardNumber: string): string {
  return cardNumber.replace(/(.{4})/g, "$1 ").trim();
}

export function generateCVV(length: 3 | 4 = 3): string {
  return randomDigits(length);
}

/** MM/YY formatında, bugünden 1-5 yıl sonrası için son kullanma. */
export function generateCardExpiry(): string {
  const now = new Date();
  const futureYear = now.getFullYear() + 1 + Math.floor(rng() * 5);
  const month = 1 + Math.floor(rng() * 12);
  return `${month.toString().padStart(2, "0")}/${futureYear.toString().slice(-2)}`;
}