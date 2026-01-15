/**
 * Veri öğeleri tanımları
 * Her veri tipinin label, kategori ve generator fonksiyonu
 */

import type { DataItem } from "../types";
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
} from "../generators";

export const DATA_ITEMS: DataItem[] = [
  // Finansal Bilgiler
  {
    id: "tckn",
    type: "tckn",
    label: "TC Kimlik No",
    category: "financial",
    generator: () => generateTCKN(),
  },
  {
    id: "vkn",
    type: "vkn",
    label: "Vergi Kimlik No",
    category: "financial",
    generator: () => generateVKN(),
  },
  {
    id: "smmm",
    type: "smmm",
    label: "SMMM Sicil No",
    category: "financial",
    generator: () => generateSMMMNo(),
  },
  {
    id: "iban",
    type: "iban",
    label: "IBAN",
    category: "financial",
    generator: () => generateIBAN(),
  },
  {
    id: "sgk",
    type: "sgk",
    label: "SGK Sicil No",
    category: "financial",
    generator: () => generateSGKNo(),
  },

  // Kişisel Bilgiler
  {
    id: "firstName",
    type: "firstName",
    label: "Ad",
    category: "personal",
    generator: () => generateFirstName(),
  },
  {
    id: "lastName",
    type: "lastName",
    label: "Soyad",
    category: "personal",
    generator: () => generateLastName(),
  },
  {
    id: "fullName",
    type: "fullName",
    label: "Ad Soyad",
    category: "personal",
    generator: () => generateFullName(),
  },
  {
    id: "birthDate",
    type: "birthDate",
    label: "Doğum Tarihi",
    category: "personal",
    generator: () => generateBirthDate(),
  },
  {
    id: "phone",
    type: "phone",
    label: "Telefon",
    category: "personal",
    generator: () => generatePhone(),
  },
  {
    id: "email",
    type: "email",
    label: "E-posta",
    category: "personal",
    generator: () => generateEmail(),
  },
  {
    id: "username",
    type: "username",
    label: "Kullanıcı Adı",
    category: "personal",
    generator: () => generateUsername(),
  },
  {
    id: "address",
    type: "address",
    label: "Tam Adres",
    category: "personal",
    isLongText: true,
    generator: () => generateFullAddress(),
  },
];

export function getDataItemById(id: string): DataItem | undefined {
  return DATA_ITEMS.find((item) => item.id === id);
}

export function getDataItemsByCategory(category: string): DataItem[] {
  return DATA_ITEMS.filter((item) => item.category === category);
}
