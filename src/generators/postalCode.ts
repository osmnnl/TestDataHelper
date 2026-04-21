/**
 * TR posta kodu üretici. 5 hane; ilk 2 hane il prefixi.
 */

import { rng } from "./random";
import { POSTAL_CODE_PREFIXES } from "../data/postalRanges";

export function generatePostalCode(): string {
  const prefix =
    POSTAL_CODE_PREFIXES[Math.floor(rng() * POSTAL_CODE_PREFIXES.length)];
  let suffix = "";
  for (let i = 0; i < 3; i++) suffix += Math.floor(rng() * 10).toString();
  return `${prefix}${suffix}`;
}
