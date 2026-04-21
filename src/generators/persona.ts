import { rng } from "./random";

/**
 * Persona üretici: Tek bir tutarlı kimliğe ait tüm alanları birlikte üretir.
 * TCKN, ad-soyad, doğum tarihi, email, KEP, telefon, adres, IBAN, kredi kartı...
 * Hepsi aynı kişiyi tarif eder.
 */

import {
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  LAST_NAMES,
  CITIES,
  DISTRICTS,
  NEIGHBORHOODS,
  STREETS,
} from "../data/names";
import { KEP_DOMAINS } from "../data/kepProviders";
import { generateTCKN } from "./tckn";
import { generateIBAN } from "./iban";
import {
  generateCreditCard,
  generateCVV,
  generateCardExpiry,
} from "./creditCard";
import { generatePlate } from "./plate";
import { generatePostalCode } from "./postalCode";
import { generatePassportNo } from "./documents";

export interface Persona {
  firstName: string;
  lastName: string;
  fullName: string;
  gender: "male" | "female";
  birthDate: string;
  tckn: string;
  email: string;
  kepEmail: string;
  username: string;
  phone: string;
  iban: string;
  creditCard: string;
  cvv: string;
  cardExpiry: string;
  address: string;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  apartmentNo: string;
  postalCode: string;
  plate: string;
  passport: string;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const TURKISH_TO_ASCII: Record<string, string> = {
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

function asciiSlug(text: string): string {
  return text
    .split("")
    .map((c) => TURKISH_TO_ASCII[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "");
}

// Türk GSM operatör prefixleri — phone.ts ile senkron tutulmalı; burada persona
// için basit bir alt küme kullanıyoruz.
const GSM_PREFIXES = ["530", "531", "532", "533", "534", "535", "536", "537", "538", "539", "540", "541", "542", "543", "544", "545", "546", "547", "548", "549", "551", "552", "553", "554", "555", "559"];

function generatePersonaPhone(): string {
  const prefix = pick(GSM_PREFIXES);
  let rest = "";
  for (let i = 0; i < 7; i++) rest += Math.floor(rng() * 10);
  return `0${prefix} ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5)}`;
}

function personaBirthDate(): string {
  const now = new Date();
  const age = 18 + Math.floor(rng() * 48);
  const year = now.getFullYear() - age;
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

export function generatePersona(): Persona {
  const gender: "male" | "female" = rng() < 0.5 ? "male" : "female";
  const firstName = pick(
    gender === "male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES,
  );
  const lastName = pick(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;

  const city = pick(CITIES);
  const districtPool = DISTRICTS[city] ?? Object.values(DISTRICTS).flat();
  const district = pick(districtPool);
  const neighborhood = pick(NEIGHBORHOODS);
  const street = pick(STREETS);
  const buildingNo = 1 + Math.floor(rng() * 150);
  const apartmentNo = 1 + Math.floor(rng() * 20);

  const firstSlug = asciiSlug(firstName);
  const lastSlug = asciiSlug(lastName);
  const emailSuffix = Math.floor(rng() * 100);
  const email = `${firstSlug}.${lastSlug}${emailSuffix > 0 ? emailSuffix : ""}@example.com`;
  const kepEmail = `${firstSlug}.${lastSlug}@${pick(KEP_DOMAINS)}`;
  const username = `${firstSlug}${lastSlug}${Math.floor(rng() * 1000)}`;

  return {
    firstName,
    lastName,
    fullName,
    gender,
    birthDate: personaBirthDate(),
    tckn: generateTCKN(),
    email,
    kepEmail,
    username,
    phone: generatePersonaPhone(),
    iban: generateIBAN(),
    creditCard: generateCreditCard("visa"),
    cvv: generateCVV(3),
    cardExpiry: generateCardExpiry(),
    address: `${neighborhood} Mahallesi, ${street} No: ${buildingNo}, Daire: ${apartmentNo}, ${district}/${city}`,
    country: "Türkiye",
    city,
    district,
    neighborhood: `${neighborhood} Mahallesi`,
    street,
    buildingNo: String(buildingNo),
    apartmentNo: String(apartmentNo),
    postalCode: generatePostalCode(),
    plate: generatePlate(),
    passport: generatePassportNo(),
  };
}