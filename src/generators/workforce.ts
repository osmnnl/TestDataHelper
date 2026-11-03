/**
 * Şirket ve İK verileri: unvan, VKN'den MERSİS, vergi dairesi, SGK işyeri
 * sicili, NACE, ücret ve amaçlı tarihler (doğum, işe giriş, çıkış, izin).
 */

import { rng } from "./random";
import { generateVKN } from "./taxNumber";
import { generateCompanyName, mersisFromVKN } from "./company";
import { PROVINCES, MAJOR_PLATES, type Province, type District } from "../data/provinces";
import { NACE_CODES } from "../data/nace";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function digits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(rng() * 10);
  return out;
}

/** 2026 brüt asgari ücret (aylık, TL). */
export const MIN_WAGE_GROSS = 33030;

/** Türkçe tutar biçimi: 35000 → "35.000,00" */
export function formatMoneyTR(value: number): string {
  const [int, dec] = value.toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec}`;
}

/** Asgari ücretin altına inmeyen, 250 TL'ye yuvarlı brüt ücret. */
export function generateSalary(): number {
  if (rng() < 0.15) return MIN_WAGE_GROSS;
  const raw = MIN_WAGE_GROSS * (1 + rng() * 2.2);
  return Math.max(MIN_WAGE_GROSS, Math.round(raw / 250) * 250);
}

// ---- İl / ilçe ------------------------------------------------------------

export interface Place {
  province: Province;
  district: District;
}

export function pickPlace(): Place {
  const major = pick(MAJOR_PLATES);
  const province =
    rng() < 0.55 ? PROVINCES.find((p) => p.plate === major)! : pick(PROVINCES);
  return { province, district: pick(province.districts) };
}

export function findProvince(nameOrPlate: string): Province | undefined {
  const k = nameOrPlate.toLocaleLowerCase("tr");
  return PROVINCES.find(
    (p) => p.plate === nameOrPlate || p.name.toLocaleLowerCase("tr") === k,
  );
}

/** "Kadıköy Vergi Dairesi" — ilçenin (Merkez'de ilin) adıyla. */
export function taxOfficeFor(place: Place): string {
  const base =
    place.district.name === "Merkez" ? place.province.name : place.district.name;
  return `${base} Vergi Dairesi`;
}

// ---- Şirket ---------------------------------------------------------------

/**
 * SGK işyeri sicil no — 26 hane:
 * M(1) işkolu(4) ünite(2) eski ünite(2) sıra(7) il(3) ilçe(2) kontrol(2) aracı(3)
 */
export function generateSgkWorkplaceNo(plate?: string, nace?: string): string {
  const il = `0${plate ?? pick(PROVINCES).plate}`;
  // İşkolu kodu: NACE Rev.2 sınıfının ilk 4 hanesi
  const iskolu = nace ? nace.replace(/\D/g, "").slice(0, 4) : digits(4);
  return [
    pick(["1", "2", "4"]),
    iskolu,
    "01",
    "01",
    digits(7),
    il,
    String(1 + Math.floor(rng() * 30)).padStart(2, "0"),
    digits(2),
    "000",
  ].join("");
}

/** 26 haneli sicili okunur gruplara böler. */
export function formatSgkWorkplaceNo(no: string): string {
  const parts = [1, 4, 2, 2, 7, 3, 2, 2, 3];
  let i = 0;
  return parts.map((n) => no.slice(i, (i += n))).join(" ");
}

/** İl plakası → sabit hat alan kodu (İstanbul ilçeye göre 212/216). */
const AREA_CODES: Record<string, string> = {
  "01": "322", "02": "416", "03": "272", "04": "472", "05": "358", "06": "312",
  "07": "242", "08": "466", "09": "256", "10": "266", "11": "228", "12": "426",
  "13": "434", "14": "374", "15": "248", "16": "224", "17": "286", "18": "376",
  "19": "364", "20": "258", "21": "412", "22": "284", "23": "424", "24": "446",
  "25": "442", "26": "222", "27": "342", "28": "454", "29": "456", "30": "438",
  "31": "326", "32": "246", "33": "324", "35": "232", "36": "474", "37": "366",
  "38": "352", "39": "288", "40": "386", "41": "262", "42": "332", "43": "274",
  "44": "422", "45": "236", "46": "344", "47": "482", "48": "252", "49": "436",
  "50": "384", "51": "388", "52": "452", "53": "464", "54": "264", "55": "362",
  "56": "484", "57": "368", "58": "346", "59": "282", "60": "356", "61": "462",
  "62": "428", "63": "414", "64": "276", "65": "432", "66": "354", "67": "372",
  "68": "382", "69": "458", "70": "338", "71": "318", "72": "488", "73": "486",
  "74": "378", "75": "478", "76": "476", "77": "226", "78": "370", "79": "348",
  "80": "328", "81": "380",
};

const ISTANBUL_ASIAN = new Set([
  "Adalar", "Ataşehir", "Beykoz", "Çekmeköy", "Kadıköy", "Kartal", "Maltepe",
  "Pendik", "Sancaktepe", "Sultanbeyli", "Şile", "Tuzla", "Ümraniye", "Üsküdar",
]);

/** Sabit hat: ilin alan koduyla "0212 345 67 89". */
export function generateLandline(plate?: string, district?: string): string {
  const area =
    plate === "34"
      ? (district ? (ISTANBUL_ASIAN.has(district) ? "216" : "212") : pick(["212", "216"]))
      : (plate && AREA_CODES[plate]) || pick(["212", "216", "312", "232"]);
  const n = digits(7);
  return `0${area} ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5)}`;
}

export interface Company {
  name: string;
  vkn: string;
  mersis: string;
  taxOffice: string;
  sgkWorkplaceNo: string;
  nace: string;
  naceTitle: string;
  phone: string;
  email: string;
  website: string;
  kepEmail: string;
  city: string;
  district: string;
  postalCode: string;
  address: string;
  foundedDate: string; // YYYY-MM-DD
}

function slug(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "");
}

export function generateCompany(): Company {
  const name = generateCompanyName();
  const vkn = generateVKN();
  const place = pickPlace();
  const nace = pick(NACE_CODES);
  const domain = `${slug(name.split(" ")[0])}.com.tr`;
  const no = 1 + Math.floor(rng() * 120);
  return {
    name,
    vkn,
    mersis: mersisFromVKN(vkn),
    taxOffice: taxOfficeFor(place),
    sgkWorkplaceNo: generateSgkWorkplaceNo(place.province.plate, nace.code),
    nace: nace.code,
    naceTitle: nace.title,
    phone: generateLandline(place.province.plate, place.district.name),
    email: `info@${domain}`,
    website: `https://www.${domain}`,
    kepEmail: `${slug(name.split(" ")[0])}@hs01.kep.tr`,
    city: place.province.name,
    district: place.district.name,
    postalCode: place.district.postalCode,
    address: `Organize Sanayi Bölgesi ${1 + Math.floor(rng() * 9)}. Cadde No: ${no}, ${place.district.name}/${place.province.name}`,
    foundedDate: isoDate(randomDateBetween(new Date(1985, 0, 1), new Date(2022, 11, 31))),
  };
}

// ---- Tarihler -------------------------------------------------------------

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Gün 13–28 aralığından seçilir: GG/AA ile AA/GG karışırsa tarih geçersiz
 * olur ve doldurma doğrulamasında yakalanır.
 */
export function randomDateBetween(from: Date, to: Date): Date {
  const t = from.getTime() + rng() * Math.max(0, to.getTime() - from.getTime());
  const d = new Date(t);
  d.setDate(13 + Math.floor(rng() * 16));
  if (d > to) d.setMonth(d.getMonth() - 1);
  return d;
}

export interface PurposeDates {
  birth: string;
  hire: string;
  exit: string;
  leaveStart: string;
  leaveEnd: string;
  validUntil: string;
  today: string;
}

export function generatePurposeDates(birth: Date): PurposeDates {
  const today = new Date();
  const adult = new Date(birth.getFullYear() + 18, birth.getMonth(), birth.getDate());
  const hireFrom = new Date(Math.max(adult.getTime(), new Date(2012, 0, 1).getTime()));
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const hire = randomDateBetween(hireFrom, lastMonth);
  // Çıkış: işe girişten sonra, bugünden önce
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const exitFrom = new Date(Math.min(
    new Date(hire.getFullYear(), hire.getMonth() + 3, 1).getTime(),
    yesterday.getTime(),
  ));
  let exit = randomDateBetween(exitFrom, yesterday);
  if (exit <= hire) exit = new Date(hire.getFullYear(), hire.getMonth(), hire.getDate() + 1);
  if (exit > yesterday) exit = yesterday;
  const leaveStart = randomDateBetween(
    new Date(today.getFullYear(), today.getMonth() + 1, 1),
    new Date(today.getFullYear(), today.getMonth() + 3, 1),
  );
  const leaveEnd = new Date(leaveStart);
  leaveEnd.setDate(leaveEnd.getDate() + 2 + Math.floor(rng() * 10));
  const validUntil = randomDateBetween(
    new Date(today.getFullYear() + 1, 0, 1),
    new Date(today.getFullYear() + 6, 0, 1),
  );
  return {
    birth: isoDate(birth),
    hire: isoDate(hire),
    exit: isoDate(exit),
    leaveStart: isoDate(leaveStart),
    leaveEnd: isoDate(leaveEnd),
    validUntil: isoDate(validUntil),
    today: isoDate(today),
  };
}
