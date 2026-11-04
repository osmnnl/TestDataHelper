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
function digits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(rng() * 10).toString();
  return out;
}

const SERIAL_LETTERS = "ABCDEFGHJKLMNPRSTUVYZ";

/** Çipli kimlik kartı seri no: harf + 2 hane + harf + 5 hane (A12B34567). */
export function generateIdCardSerial(): string {
  const l = () => SERIAL_LETTERS[Math.floor(rng() * SERIAL_LETTERS.length)];
  return `${l()}${digits(2)}${l()}${digits(5)}`;
}

/** Nüfus kaydı: cilt 1–9999, aile sıra 1–999, birey sıra 1–99. */
export function generateRegistry(): { volume: string; family: string; person: string } {
  const n = (max: number) => String(1 + Math.floor(rng() * max));
  return { volume: n(9999), family: n(999), person: n(99) };
}

/** UAVT adres kodu: 10 hane, başı sıfır değil. */
export function generateAddressCode(): string {
  return `${1 + Math.floor(rng() * 9)}${digits(9)}`;
}
