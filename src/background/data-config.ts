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
  {
    id: "creditCard",
    label: "Kredi Kartı No",
    category: "financial",
    generator: () => generateCreditCard("visa"),
  },
  {
    id: "cvv",
    label: "CVV",
    category: "financial",
    generator: () => generateCVV(3),
  },
  {
    id: "cardExpiry",
    label: "Son Kullanma (MM/YY)",
    category: "financial",
    generator: generateCardExpiry,
  },
  {
    id: "mersis",
    label: "MERSIS No",
    category: "financial",
    generator: generateMersisNo,
  },
  {
    id: "companyName",
    label: "Firma Adı",
    category: "financial",
    generator: generateCompanyName,
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
  {
    id: "postalCode",
    label: "Posta Kodu",
    category: "personal",
    generator: generatePostalCode,
  },
  {
    id: "plate",
    label: "Plaka",
    category: "personal",
    generator: generatePlate,
  },
  {
    id: "kepEmail",
    label: "KEP E-posta",
    category: "personal",
    generator: generateKEPEmail,
  },
  {
    id: "driverLicense",
    label: "Ehliyet Sınıfı",
    category: "personal",
    generator: generateDriverLicenseClass,
  },
  {
    id: "driverLicenseNo",
    label: "Ehliyet No",
    category: "personal",
    generator: generateDriverLicenseNo,
  },
  {
    id: "passport",
    label: "Pasaport No",
    category: "personal",
    generator: generatePassportNo,
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
