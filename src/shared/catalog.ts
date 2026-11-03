/**
 * Tek veri kataloğu: popup satırları, sağ tık "Alana ekle" menüsü ve toplu
 * dosya kolonları aynı listeden beslenir. Değerler geçerli persona ve
 * şirketten okunur; böylece hepsi aynı kişiyi / işyerini tarif eder.
 */

import {
  formatIBAN,
  formatMoneyTR,
  formatSgkWorkplaceNo,
  validateIBAN,
  validateTCKN,
  validateVKN,
  MIN_WAGE_GROSS,
} from "../generators";
import type { FillContext } from "./values";

export type TabId = "person" | "company" | "finance" | "address" | "date" | "text";

export interface CatalogItem {
  id: string;
  label: string;
  tab: TabId;
  get: (ctx: FillContext) => string;
  /** Popup'ta değerin yanında gösterilen doğrulama işareti */
  check?: (ctx: FillContext) => string;
  /** Popup'ta gösterilen biçim (kopyalanan değer `get`) */
  display?: (ctx: FillContext) => string;
}

export const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "person", label: "Kişi" },
  { id: "company", label: "Şirket" },
  { id: "finance", label: "Finans" },
  { id: "address", label: "Adres" },
  { id: "date", label: "Tarih" },
  { id: "text", label: "Metin" },
];

function d(iso: string): string {
  const [y, m, day] = iso.split("-");
  return `${day}.${m}.${y}`;
}

export const CATALOG: readonly CatalogItem[] = [
  // Kişi
  { id: "tckn", label: "TC Kimlik No", tab: "person", get: (c) => c.persona.tckn, check: (c) => (validateTCKN(c.persona.tckn) ? "geçerli" : "") },
  { id: "foreignId", label: "Yabancı Kimlik No", tab: "person", get: (c) => c.persona.foreignId, check: (c) => (validateTCKN(c.persona.foreignId) ? "99 · geçerli" : "") },
  { id: "fullName", label: "Ad Soyad", tab: "person", get: (c) => c.persona.fullName },
  { id: "firstName", label: "Ad", tab: "person", get: (c) => c.persona.firstName },
  { id: "lastName", label: "Soyad", tab: "person", get: (c) => c.persona.lastName },
  { id: "motherName", label: "Anne Adı", tab: "person", get: (c) => c.persona.motherName },
  { id: "fatherName", label: "Baba Adı", tab: "person", get: (c) => c.persona.fatherName },
  { id: "gender", label: "Cinsiyet", tab: "person", get: (c) => (c.persona.gender === "female" ? "Kadın" : "Erkek") },
  { id: "birthPlace", label: "Doğum Yeri", tab: "person", get: (c) => c.persona.birthPlace },
  { id: "phone", label: "Cep Telefonu", tab: "person", get: (c) => c.persona.phone },
  { id: "homePhone", label: "Ev Telefonu", tab: "person", get: (c) => c.persona.homePhone },
  { id: "email", label: "E-posta", tab: "person", get: (c) => c.persona.email },
  { id: "workEmail", label: "İş E-postası", tab: "person", get: (c) => c.persona.workEmail },
  { id: "workPhone", label: "İş Telefonu", tab: "person", get: (c) => c.persona.workPhone },
  { id: "kepEmail", label: "KEP Adresi", tab: "person", get: (c) => c.persona.kepEmail },
  { id: "username", label: "Kullanıcı Adı", tab: "person", get: (c) => c.persona.username },
  { id: "password", label: "Şifre", tab: "person", get: (c) => c.persona.password },
  { id: "passport", label: "Pasaport No", tab: "person", get: (c) => c.persona.passport },
  { id: "sgk", label: "SGK Sicil No", tab: "person", get: (c) => c.persona.tckn, check: () => "= TCKN" },
  { id: "driverLicense", label: "Ehliyet Sınıfı", tab: "person", get: (c) => c.persona.driverLicenseClass },
  { id: "driverLicenseNo", label: "Ehliyet No", tab: "person", get: (c) => c.persona.driverLicenseNo },
  { id: "smmm", label: "SMMM Sicil No", tab: "person", get: (c) => c.persona.smmmNo },
  { id: "jobTitle", label: "Görev / Unvan", tab: "person", get: (c) => c.persona.jobTitle },
  { id: "department", label: "Departman", tab: "person", get: (c) => c.persona.department },

  // Şirket
  { id: "companyName", label: "Ticari Unvan", tab: "company", get: (c) => c.company.name },
  { id: "vkn", label: "Vergi Kimlik No", tab: "company", get: (c) => c.company.vkn, check: (c) => (validateVKN(c.company.vkn) ? "sağlama ✓" : "") },
  { id: "taxOffice", label: "Vergi Dairesi", tab: "company", get: (c) => c.company.taxOffice },
  { id: "mersis", label: "MERSİS No", tab: "company", get: (c) => c.company.mersis, check: () => "VKN'den" },
  { id: "sgkWorkplaceNo", label: "SGK İşyeri Sicili · 26 hane", tab: "company", get: (c) => c.company.sgkWorkplaceNo, display: (c) => formatSgkWorkplaceNo(c.company.sgkWorkplaceNo) },
  { id: "nace", label: "NACE Kodu", tab: "company", get: (c) => c.company.nace, display: (c) => `${c.company.nace} ${c.company.naceTitle}` },
  { id: "companyPhone", label: "Şirket Telefonu", tab: "company", get: (c) => c.company.phone },
  { id: "companyEmail", label: "Şirket E-postası", tab: "company", get: (c) => c.company.email },
  { id: "companyKep", label: "Şirket KEP", tab: "company", get: (c) => c.company.kepEmail },
  { id: "website", label: "Web Sitesi", tab: "company", get: (c) => c.company.website },
  { id: "companyAddress", label: "Şirket Adresi", tab: "company", get: (c) => c.company.address },

  // Finans
  { id: "iban", label: "IBAN · 26 hane", tab: "finance", get: (c) => c.persona.iban, display: (c) => formatIBAN(c.persona.iban), check: (c) => (validateIBAN(c.persona.iban) ? "mod 97 ✓" : "") },
  { id: "salary", label: "Brüt Ücret", tab: "finance", get: (c) => formatMoneyTR(c.persona.salary), check: (c) => (c.persona.salary >= MIN_WAGE_GROSS ? "≥ asgari" : "") },
  { id: "creditCard", label: "Kart No", tab: "finance", get: (c) => c.persona.creditCard },
  { id: "cvv", label: "CVV", tab: "finance", get: (c) => c.persona.cvv },
  { id: "cardExpiry", label: "Son Kullanma", tab: "finance", get: (c) => c.persona.cardExpiry },

  // Adres
  { id: "address", label: "Tam Adres", tab: "address", get: (c) => c.persona.address },
  { id: "city", label: "İl", tab: "address", get: (c) => c.persona.city, check: (c) => `${c.persona.plateCode} plaka` },
  { id: "district", label: "İlçe", tab: "address", get: (c) => c.persona.district },
  { id: "postalCode", label: "Posta Kodu", tab: "address", get: (c) => c.persona.postalCode },
  { id: "neighborhood", label: "Mahalle", tab: "address", get: (c) => c.persona.neighborhood },
  { id: "avenue", label: "Cadde", tab: "address", get: (c) => c.persona.avenue },
  { id: "street", label: "Sokak", tab: "address", get: (c) => c.persona.street },
  { id: "buildingNo", label: "Bina No", tab: "address", get: (c) => c.persona.buildingNo },
  { id: "apartmentNo", label: "Daire No", tab: "address", get: (c) => c.persona.apartmentNo },
  { id: "plate", label: "Araç Plakası", tab: "address", get: (c) => c.persona.plate },

  // Tarih
  { id: "birthDate", label: "Doğum Tarihi", tab: "date", get: (c) => d(c.persona.dates.birth) },
  { id: "hireDate", label: "İşe Giriş Tarihi", tab: "date", get: (c) => d(c.persona.dates.hire) },
  { id: "exitDate", label: "İşten Çıkış Tarihi", tab: "date", get: (c) => d(c.persona.dates.exit) },
  { id: "leaveStart", label: "İzin Başlangıcı", tab: "date", get: (c) => d(c.persona.dates.leaveStart) },
  { id: "leaveEnd", label: "İzin Bitişi", tab: "date", get: (c) => d(c.persona.dates.leaveEnd) },
  { id: "validUntil", label: "Geçerlilik Tarihi", tab: "date", get: (c) => d(c.persona.dates.validUntil) },
  { id: "today", label: "Bugün", tab: "date", get: (c) => d(c.persona.dates.today) },
];

export function catalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((i) => i.id === id);
}
