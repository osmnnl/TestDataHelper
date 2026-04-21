/**
 * Firma adı ve MERSIS numarası üretici.
 */

import { rng } from "./random";
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

/**
 * MERSIS No (Merkezi Sicil Kayıt Sistemi) — 16 hane.
 * Gerçek algoritma kamuya açık olmadığından rastgele 16 hane üretir.
 */
export function generateMersisNo(): string {
  let out = "";
  for (let i = 0; i < 16; i++) out += Math.floor(rng() * 10).toString();
  return out;
}
