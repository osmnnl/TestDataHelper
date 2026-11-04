/**
 * Generator modülleri merkezi export
 */

// TC Kimlik No
export { generateTCKN, validateTCKN, generateForeignId } from "./tckn";

// Vergi Kimlik No
export { generateVKN, validateVKN } from "./taxNumber";

// SMMM No
export { generateSMMMNo } from "./smmm";

// IBAN
export { generateIBAN, formatIBAN, validateIBAN, TR_BANKS } from "./iban";

// Telefon
export { generatePhone, formatPhone } from "./phone";

// Metin
export { generateText, generateLoremIpsum } from "./text";

// Kişisel Bilgiler
export {
  generateFirstName,
  generateLastName,
  generateFullName,
  generateEmail,
  generateKEPEmail,
  generateUsername,
  generateBirthDate,
} from "./personal";

// Firma / MERSIS
export { generateCompanyName, generateMersisNo, mersisFromVKN } from "./company";

// Persona (tutarlı kişi)
export { generatePersona, type Persona } from "./persona";

// Seedable PRNG (deterministik üretim için)
export { withSeed, hashSeed } from "./random";

// Regex pattern generator
export { generateFromPattern } from "./regex";

// Ehliyet / Pasaport
export {
  generateDriverLicenseClass,
  generateDriverLicenseNo,
  generatePassportNo,
  generateIdCardSerial,
  generateRegistry,
  generateAddressCode,
} from "./documents";

// SGK
export { generateSGKNo, generateFormattedSGKNo } from "./sgk";

// Kredi Kartı
export {
  generateCreditCard,
  formatCreditCard,
  generateCVV,
  generateCardExpiry,
} from "./creditCard";

// Plaka
export { generatePlate } from "./plate";

// Posta Kodu
export { generatePostalCode } from "./postalCode";

// Adres
export {
  generateCountry,
  generateCity,
  generateDistrict,
  generateNeighborhood,
  generateStreet,
  generateBuildingNo,
  generateApartmentNo,
  generateFullAddress,
} from "./address";

// Şirket, ücret, amaçlı tarihler
export {
  MIN_WAGE_GROSS,
  formatMoneyTR,
  generateSalary,
  generateCompany,
  generateSgkWorkplaceNo,
  formatSgkWorkplaceNo,
  generateLandline,
  pickPlace,
  findProvince,
  taxOfficeFor,
  isoDate,
  type Company,
  type PurposeDates,
} from "./workforce";
