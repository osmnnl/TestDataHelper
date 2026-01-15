/**
 * Generator modülleri merkezi export
 */

// TC Kimlik No
export { generateTCKN, validateTCKN } from "./tckn";

// Vergi Kimlik No
export { generateVKN } from "./taxNumber";

// SMMM No
export { generateSMMMNo } from "./smmm";

// IBAN
export { generateIBAN, formatIBAN } from "./iban";

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
  generateUsername,
  generateBirthDate,
} from "./personal";

// SGK
export { generateSGKNo, generateFormattedSGKNo } from "./sgk";

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
