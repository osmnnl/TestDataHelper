import { rng } from "./random";

/**
 * Vergi Kimlik No (VKN) — 10 hane, son hane GİB sağlama algoritmasıyla.
 */

function vknCheckDigit(first9: number[]): number {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (first9[i] + 9 - i) % 10;
    if (tmp === 0) continue;
    let v = (tmp * 2 ** (9 - i)) % 9;
    if (v === 0) v = 9;
    sum += v;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateVKN(): string {
  const digits: number[] = [Math.floor(rng() * 9) + 1];
  for (let i = 1; i < 9; i++) digits.push(Math.floor(rng() * 10));
  digits.push(vknCheckDigit(digits));
  return digits.join("");
}

export function validateVKN(vkn: string): boolean {
  if (!/^\d{10}$/.test(vkn)) return false;
  const d = vkn.split("").map(Number);
  return vknCheckDigit(d.slice(0, 9)) === d[9];
}
