/**
 * Türk araç plakası üretici. Format: `34 AB 1234`, `06 ABC 12`, `34 A 1234` gibi.
 */

import { rng } from "./random";
import { PLATE_CITY_CODES, PLATE_LETTERS } from "../data/plateCodes";

function randomLetters(count: number): string {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += PLATE_LETTERS[Math.floor(rng() * PLATE_LETTERS.length)];
  }
  return out;
}

function randomDigits(count: number): string {
  let out = "";
  for (let i = 0; i < count; i++) out += Math.floor(rng() * 10).toString();
  return out;
}

export function generatePlate(): string {
  const city = PLATE_CITY_CODES[Math.floor(rng() * PLATE_CITY_CODES.length)];

  // Patern dağılımı: 1 harf (4 rakam), 2 harf (3 veya 4 rakam), 3 harf (2 rakam)
  const pattern = rng();
  let letters: string;
  let digits: string;
  if (pattern < 0.15) {
    letters = randomLetters(1);
    digits = randomDigits(4);
  } else if (pattern < 0.85) {
    letters = randomLetters(2);
    digits = randomDigits(3 + Math.floor(rng() * 2));
  } else {
    letters = randomLetters(3);
    digits = randomDigits(2);
  }

  return `${city} ${letters} ${digits}`;
}
