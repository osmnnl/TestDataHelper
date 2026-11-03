/**
 * Alan türü → değer. Persona ve şirket aynı kişiyi / işyerini tarif eder;
 * doldurma motoru bu değeri alanın biçimine (tarih biçimi, maske, liste
 * seçeneği) göre yazar.
 */

import type { Persona, Company } from "../generators";
import { formatMoneyTR } from "../generators";
import type { FieldKind } from "./matcher";

export interface FillContext {
  persona: Persona;
  company: Company;
}

export interface FieldValue {
  /** Varsayılan metin biçimi */
  text: string;
  /** Tarih türleri için YYYY-MM-DD */
  iso?: string;
  /** Telefon için 10 hane (başında 0 yok): 5324182763 */
  phoneDigits?: string;
  /** Sayı alanları için düz sayı */
  number?: number;
  /** Liste seçeneklerinde aranacak metinler (öncelik sırasıyla) */
  optionHints?: string[];
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function displayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function date(iso: string): FieldValue {
  return { text: displayDate(iso), iso };
}

function phone(p: string): FieldValue {
  const digits = digitsOnly(p).replace(/^0/, "");
  return { text: p, phoneDigits: digits };
}

const LOREM = [
  "Test amaçlı oluşturulmuş açıklama metni.",
  "Bu kayıt otomatik test verisiyle doldurulmuştur.",
  "Deneme kaydı; gerçek kişi veya kurumla ilgisi yoktur.",
];

export function valueFor(kind: FieldKind, ctx: FillContext, label = ""): FieldValue | null {
  const p = ctx.persona;
  const c = ctx.company;
  const age = new Date().getFullYear() - Number(p.dates.birth.slice(0, 4));
  switch (kind) {
    case "firstName": return { text: p.firstName };
    case "lastName": return { text: p.lastName };
    case "fullName": return { text: p.fullName };
    case "motherName": return { text: p.motherName };
    case "fatherName": return { text: p.fatherName };
    case "birthPlace": return { text: p.birthPlace, optionHints: [p.birthPlace] };
    case "gender": {
      const t = p.gender === "female" ? "Kadın" : "Erkek";
      return { text: t, optionHints: p.gender === "female" ? ["Kadın", "Kadin", "Bayan", "Female", "K"] : ["Erkek", "Bay", "Male", "E"] };
    }
    case "maritalStatus": return { text: "Bekar", optionHints: ["Bekar", "Bekâr", "Evli"] };
    case "nationality": return { text: "T.C.", optionHints: ["T.C.", "Türkiye", "TC", "Türk"] };
    case "age": return { text: String(age), number: age };
    case "tckn": return { text: p.tckn };
    case "foreignId": return { text: p.foreignId };
    case "passport": return { text: p.passport };
    case "driverLicenseClass": return { text: p.driverLicenseClass, optionHints: [p.driverLicenseClass] };
    case "driverLicenseNo": return { text: p.driverLicenseNo };
    case "smmmNo": return { text: p.smmmNo };
    case "sgkNo": return { text: p.tckn };
    case "email": return { text: p.email };
    case "workEmail": return { text: p.workEmail };
    case "kepEmail": return { text: p.kepEmail };
    case "username": return { text: p.username };
    case "password": return { text: p.password };
    case "phone": return phone(p.phone);
    case "workPhone": return phone(p.workPhone);
    case "homePhone": return phone(p.homePhone);
    case "countryCode": return null;
    case "birthDate": return date(p.dates.birth);
    case "hireDate": return date(p.dates.hire);
    case "exitDate": return date(p.dates.exit);
    case "leaveStart": return date(p.dates.leaveStart);
    case "leaveEnd": return date(p.dates.leaveEnd);
    case "validUntil": return date(p.dates.validUntil);
    case "date": return date(p.dates.today);
    case "time": return { text: "09:00" };
    case "country": return { text: "Türkiye", optionHints: ["Türkiye", "Turkiye", "Turkey", "TR"] };
    case "city": return { text: p.city, optionHints: [p.city] };
    case "district": return { text: p.district, optionHints: [p.district, "Merkez"] };
    case "neighborhood": return { text: p.neighborhood, optionHints: [p.neighborhood] };
    case "avenue": return { text: p.avenue };
    case "street": return { text: p.street };
    case "buildingNo": return { text: p.buildingNo, number: Number(p.buildingNo) };
    case "apartmentNo": return { text: p.apartmentNo, number: Number(p.apartmentNo) };
    case "postalCode": return { text: p.postalCode, number: Number(p.postalCode) };
    case "address": return { text: p.address };
    case "plate": return { text: p.plate };
    case "companyName": return { text: c.name };
    case "vkn": return { text: c.vkn };
    case "mersis": return { text: c.mersis };
    case "taxOffice": return { text: c.taxOffice, optionHints: [c.taxOffice.replace(/ Vergi Dairesi$/, "")] };
    case "sgkWorkplaceNo": return { text: c.sgkWorkplaceNo };
    case "nace": return { text: c.nace };
    case "jobTitle": return { text: p.jobTitle, optionHints: [p.jobTitle] };
    case "department": return { text: p.department, optionHints: [p.department] };
    case "salary": return { text: formatMoneyTR(p.salary), number: p.salary };
    case "iban": return { text: p.iban };
    case "creditCard": return { text: p.creditCard };
    case "cvv": return { text: p.cvv };
    case "cardExpiry": return { text: p.cardExpiry };
    case "url": return { text: c.website };
    case "number": return { text: String(1 + Math.floor(Math.random() * 99)), number: 1 + Math.floor(Math.random() * 99) };
    case "longText": return { text: LOREM[Math.floor(Math.random() * LOREM.length)] };
    case "text": {
      const base = label.replace(/[*:]/g, "").trim();
      return { text: base ? `Test ${base}`.slice(0, 40) : "Test" };
    }
  }
}

