/**
 * Firma adı ve MERSIS numarası üretici.
 */

import { rng } from "./random";
import { generateVKN } from "./taxNumber";
import {
  COMPANY_PREFIXES,
  COMPANY_ROOTS,
  COMPANY_SECTORS,
  COMPANY_SUFFIXES,
} from "../data/companyNames";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateCompanyName(): string {
  // %50: prefix + root, %50: root tek başına
  const core =
    rng() < 0.5
      ? `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_ROOTS)}`
      : pick(COMPANY_ROOTS);
  return `${core} ${pick(COMPANY_SECTORS)} ${pick(COMPANY_SUFFIXES)}`;
}

/** MERSİS: 0 + VKN + 5 hane (16 hane). */
export function mersisFromVKN(vkn: string): string {
  return `0${vkn}${pick(["00015", "00017", "00018", "00019"])}`;
}

/** MERSİS No — geçerli bir VKN'den türetilir. */
export function generateMersisNo(): string {
  return mersisFromVKN(generateVKN());
}
