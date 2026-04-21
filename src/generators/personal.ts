import { rng } from "./random";

/**
 * Kişisel Bilgi Generator
 * Ad, Soyad, Ad Soyad, Email, Username üretimi
 */

import { ALL_FIRST_NAMES, LAST_NAMES } from "../data/names";
import { KEP_DOMAINS } from "../data/kepProviders";

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(rng() * array.length)];
}

/**
 * Rastgele isim üret
 */
export function generateFirstName(): string {
  return getRandomItem(ALL_FIRST_NAMES);
}

/**
 * Rastgele soyad üret
 */
export function generateLastName(): string {
  return getRandomItem(LAST_NAMES);
}

/**
 * Rastgele ad soyad üret
 */
export function generateFullName(): string {
  return `${generateFirstName()} ${generateLastName()}`;
}

/**
 * Türkçe karakterleri ASCII'ye dönüştür
 */
function turkishToAscii(text: string): string {
  const map: Record<string, string> = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  return text
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

/**
 * Email adresi üret
 * Format: ad.soyad@example.com
 */
export function generateEmail(): string {
  const firstName = turkishToAscii(generateFirstName())
    .toLowerCase()
    .replace(/\s+/g, "");
  const lastName = turkishToAscii(generateLastName())
    .toLowerCase()
    .replace(/\s+/g, "");

  return `${firstName}.${lastName}@example.com`;
}

/**
 * KEP (Kayıtlı Elektronik Posta) adresi üret.
 * Format: ad.soyad@hsXX.kep.tr
 */
export function generateKEPEmail(): string {
  const firstName = turkishToAscii(generateFirstName())
    .toLowerCase()
    .replace(/\s+/g, "");
  const lastName = turkishToAscii(generateLastName())
    .toLowerCase()
    .replace(/\s+/g, "");
  const domain = KEP_DOMAINS[Math.floor(rng() * KEP_DOMAINS.length)];
  return `${firstName}.${lastName}@${domain}`;
}

/**
 * Kullanıcı adı üret
 * Format: ad + soyad + rastgele sayı
 */
export function generateUsername(): string {
  const firstName = turkishToAscii(generateFirstName()).toLowerCase();
  const lastName = turkishToAscii(generateLastName()).toLowerCase();
  const randomNum = Math.floor(rng() * 1000);

  return `${firstName}${lastName}${randomNum}`;
}

/**
 * Rastgele doğum tarihi üret
 * Format: DD.MM.YYYY (18-65 yaş arası)
 */
export function generateBirthDate(): string {
  const now = new Date();
  const minAge = 18;
  const maxAge = 65;

  const randomAge = Math.floor(rng() * (maxAge - minAge + 1)) + minAge;
  const birthYear = now.getFullYear() - randomAge;
  const birthMonth = Math.floor(rng() * 12) + 1;
  const birthDay = Math.floor(rng() * 28) + 1;

  const day = birthDay.toString().padStart(2, "0");
  const month = birthMonth.toString().padStart(2, "0");

  return `${day}.${month}.${birthYear}`;
}