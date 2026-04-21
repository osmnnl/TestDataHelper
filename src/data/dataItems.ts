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
  generateCreditCard,
  generateCVV,
  generateCardExpiry,
  generatePlate,
  generatePostalCode,
  generateKEPEmail,
  generateCompanyName,
  generateMersisNo,
  generateDriverLicenseClass,
  generateDriverLicenseNo,
  generatePassportNo,
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
  {
    id: "creditCard",
    type: "creditCard",
    label: "Kredi Kartı No",
    category: "financial",
    generator: () => generateCreditCard("visa"),
  },
  {
    id: "cvv",
    type: "cvv",
    label: "CVV",
    category: "financial",
    generator: () => generateCVV(3),
  },
  {
    id: "cardExpiry",
    type: "cardExpiry",
    label: "Son Kullanma",
    category: "financial",
    generator: () => generateCardExpiry(),
  },
  {
    id: "mersis",
    type: "mersis",
    label: "MERSIS No",
    category: "financial",
    generator: () => generateMersisNo(),
  },
  {
    id: "companyName",
    type: "companyName",
    label: "Firma Adı",
    category: "financial",
    generator: () => generateCompanyName(),
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
  {
    id: "postalCode",
    type: "postalCode",
    label: "Posta Kodu",
    category: "personal",
    generator: () => generatePostalCode(),
  },
  {
    id: "plate",
    type: "plate",
    label: "Plaka",
    category: "personal",
    generator: () => generatePlate(),
  },
  {
    id: "kepEmail",
    type: "kepEmail",
    label: "KEP E-posta",
    category: "personal",
    generator: () => generateKEPEmail(),
  },
  {
    id: "driverLicense",
    type: "driverLicense",
    label: "Ehliyet Sınıfı",
    category: "personal",
    generator: () => generateDriverLicenseClass(),
  },
  {
    id: "driverLicenseNo",
    type: "driverLicenseNo",
    label: "Ehliyet No",
    category: "personal",
    generator: () => generateDriverLicenseNo(),
  },
  {
    id: "passport",
    type: "passport",
    label: "Pasaport No",
    category: "personal",
    generator: () => generatePassportNo(),
  },
];

export function getDataItemById(id: string): DataItem | undefined {
  return DATA_ITEMS.find((item) => item.id === id);
}

export function getDataItemsByCategory(category: string): DataItem[] {
  return DATA_ITEMS.filter((item) => item.category === category);
}
