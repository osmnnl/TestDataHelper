import { rng } from "./random";

/**
 * Ehliyet ve pasaport üretici.
 */

const DRIVER_LICENSE_CLASSES = [
  "A1",
  "A2",
  "A",
  "B",
  "B1",
  "BE",
  "C",
  "C1",
  "CE",
  "D",
  "D1",
  "DE",
  "F",
  "G",
  "M",
] as const;

export function generateDriverLicenseClass(): string {
  return DRIVER_LICENSE_CLASSES[
    Math.floor(rng() * DRIVER_LICENSE_CLASSES.length)
  ];
}

/**
 * Ehliyet numarası — 6 haneli sayı (TR ehliyetlerinde değişken).
 */
export function generateDriverLicenseNo(): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += Math.floor(rng() * 10).toString();
  return out;
}

/**
 * Pasaport numarası — 1 harf + 8 rakam (TR umumi pasaport formatı).
 */
export function generatePassportNo(): string {
  const letter = String.fromCharCode(65 + Math.floor(rng() * 26));
  let digits = "";
  for (let i = 0; i < 8; i++) digits += Math.floor(rng() * 10).toString();
  return `${letter}${digits}`;
}