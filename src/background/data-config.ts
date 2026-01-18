/**
 * Data Items Configuration for Background Service Worker
 * Pure generator functions without React dependencies
 */

import {
  generateTCKN,
  generateVKN,
  generateSMMMNo,
  generateIBAN,
  generateSGKNo,
  generatePhone,
  generateFirstName,
  generateLastName,
  generateFullName,
  generateEmail,
  generateUsername,
  generateBirthDate,
  generateFullAddress,
  generateText,
} from "../generators";

interface DataItemConfig {
  id: string;
  label: string;
  category: "financial" | "personal" | "text";
  generator: () => string;
}

export type { DataItemConfig };

export const DATA_ITEMS_CONFIG: DataItemConfig[] = [
  // Finansal
  {
    id: "tckn",
    label: "TC Kimlik No",
    category: "financial",
    generator: generateTCKN,
  },
  {
    id: "vkn",
    label: "Vergi Kimlik No",
    category: "financial",
    generator: generateVKN,
  },
  {
    id: "smmm",
    label: "SMMM Sicil No",
    category: "financial",
    generator: generateSMMMNo,
  },
  { id: "iban", label: "IBAN", category: "financial", generator: generateIBAN },
  {
    id: "sgk",
    label: "SGK Sicil No",
    category: "financial",
    generator: generateSGKNo,
  },
  // Kişisel
  {
    id: "firstName",
    label: "Ad",
    category: "personal",
    generator: generateFirstName,
  },
  {
    id: "lastName",
    label: "Soyad",
    category: "personal",
    generator: generateLastName,
  },
  {
    id: "fullName",
    label: "Ad Soyad",
    category: "personal",
    generator: generateFullName,
  },
  {
    id: "birthDate",
    label: "Doğum Tarihi",
    category: "personal",
    generator: generateBirthDate,
  },
  {
    id: "phone",
    label: "Telefon",
    category: "personal",
    generator: generatePhone,
  },
  {
    id: "email",
    label: "E-posta",
    category: "personal",
    generator: generateEmail,
  },
  {
    id: "username",
    label: "Kullanıcı Adı",
    category: "personal",
    generator: generateUsername,
  },
  {
    id: "address",
    label: "Tam Adres",
    category: "personal",
    generator: generateFullAddress,
  },
  // Metin
  {
    id: "text50",
    label: "50 Karakter",
    category: "text",
    generator: () => generateText({ length: 50 }),
  },
  {
    id: "text100",
    label: "100 Karakter",
    category: "text",
    generator: () => generateText({ length: 100 }),
  },
  {
    id: "text250",
    label: "250 Karakter",
    category: "text",
    generator: () => generateText({ length: 250 }),
  },
  {
    id: "text500",
    label: "500 Karakter",
    category: "text",
    generator: () => generateText({ length: 500 }),
  },
];
