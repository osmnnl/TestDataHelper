/**
 * Tek alan eşleyici: bir form alanının etiket / name / placeholder gibi
 * ipuçlarından ne tür veri beklediğini bulur. Service worker, sayfa içi
 * doldurma motoru ve yan panel aynı modülü kullanır.
 *
 * Türkçe karakterler önce ASCII'ye çevrilir (toLocaleLowerCase("tr")), sonra
 * kurallar uygulanır; bu yüzden \b sınırları güvenle çalışır.
 */

export type FieldKind =
  | "firstName" | "lastName" | "fullName" | "motherName" | "fatherName"
  | "birthPlace" | "gender" | "maritalStatus" | "nationality" | "age"
  | "tckn" | "foreignId" | "passport" | "sgkNo"
  | "email" | "workEmail" | "kepEmail" | "username" | "password"
  | "phone" | "workPhone" | "homePhone" | "countryCode"
  | "birthDate" | "hireDate" | "exitDate" | "leaveStart" | "leaveEnd"
  | "validUntil" | "date" | "time"
  | "country" | "city" | "district" | "neighborhood" | "avenue" | "street"
  | "buildingNo" | "apartmentNo" | "postalCode" | "address" | "plate"
  | "companyName" | "vkn" | "mersis" | "taxOffice" | "sgkWorkplaceNo" | "nace"
  | "jobTitle" | "department" | "salary"
  | "iban" | "creditCard" | "cvv" | "cardExpiry"
  | "url" | "number" | "longText" | "text";

export interface FieldHints {
  /** Görünen etiket: <label for>, saran label, legend, aria-label(ledby) */
  label?: string;
  placeholder?: string;
  name?: string;
  id?: string;
  autocomplete?: string;
  /** input type ya da "select" / "combobox" / "textarea" */
  type?: string;
}

/** "İşe Giriş_Tarihi" → "ise giris tarihi" */
export function normalizeTr(input: string): string {
  return input
    .replace(/([a-zçğıöşü])([A-ZÇĞİÖŞÜ])/g, "$1 $2")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/̇/g, "")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type Rule = [FieldKind, RegExp];

// Sıra önemli: özelden genele.
const RULES: Rule[] = [
  ["countryCode", /\b(ulke|alan) kodu?\b|country code|dial code/],
  ["motherName", /\banne(si|nin)? (adi?|ismi)\b|\bana adi\b|\bmother/],
  ["fatherName", /\bbaba(si|nin)? (adi?|ismi)\b|\bfather/],
  ["birthPlace", /\bdogum yeri|birth ?place|place of birth/],
  ["foreignId", /yabanci kimlik|\bykn\b|foreign id|foreigner/],
  ["mersis", /\bmersis/],
  ["sgkWorkplaceNo", /isyeri sicil|sgk isyeri|isyeri (no|numara)|workplace (no|number)/],
  ["taxOffice", /vergi dairesi|\bv ?d\b|tax office/],
  ["vkn", /vergi (kimlik )?(no|numara)|\bvkn\b|tax (id|number|no)/],
  ["tckn", /\btc\b|tckn|\bt c\b|kimlik (no|numara)|national id|identity (no|number)|\bssn\b/],
  ["sgkNo", /\bsgk\b|\bssk\b|sigorta sicil/],
  ["nace", /\bnace\b|faaliyet kodu/],
  ["iban", /\biban\b|hesap (no|numara)/],
  ["cvv", /\bcvv|\bcvc|\bccv\b|guvenlik kodu/],
  ["cardExpiry", /son kullanma|expir|\bmm ?yy\b|\bskt\b/],
  ["creditCard", /kart (no|numara)|kredi karti|card (no|number)|\bcc\b/],
  ["kepEmail", /\bkep\b/],
  ["workEmail", /\b(is|kurumsal|sirket|ofis|work|business|corporate) (e ?posta|e ?mail|mail|eposta)/],
  ["email", /e ?posta|e ?mail|\bmail\b|eposta/],
  ["workPhone", /\b(is|sirket|ofis|isyeri|work|office|business) (tel|telefon|phone)|dahili|\bfaks|\bfax/],
  ["homePhone", /\b(ev|sabit) (tel|telefon|hat)|home phone|landline/],
  ["phone", /telefon|\btel\b|\bgsm\b|\bcep\b|mobile|phone/],
  ["leaveStart", /izin (baslangic|baslama)|leave start/],
  ["leaveEnd", /izin (bitis|donus)|leave end|donus tarihi/],
  ["birthDate", /dogum (tarihi|gunu)|\bdogum\b|birth|\bdob\b|\bbday\b/],
  ["hireDate", /ise (giris|baslama|baslangic)|giris tarihi|baslangic tarihi|kidem tarihi|\bhire|start date|istihdam/],
  ["exitDate", /cikis tarihi|isten cikis|ayrilis|ayrilma|bitis tarihi|end date|termination/],
  ["validUntil", /gecerlilik|valid until|expiry date|son tarih/],
  ["time", /\bsaat\b|\btime\b/],
  ["date", /tarih|\bdate\b/],
  ["postalCode", /posta kodu?|postal|\bzip\b|postcode/],
  ["neighborhood", /mahalle|\bmah\b|neighbo/],
  ["avenue", /cadde|\bcad\b|avenue/],
  ["street", /sokak|\bsok\b|\bstreet\b(?! address)/],
  ["buildingNo", /bina (no|numara)|dis kapi|kapi (no|numara)|building/],
  ["apartmentNo", /daire|ic kapi|apartment|\bapt\b|\bflat\b/],
  ["district", /\bilce|district|county/],
  ["city", /\bil\b|\bsehir|\bcity\b|province|\bstate\b/],
  ["nationality", /uyruk|nationality|vatandaslik/],
  ["country", /\bulke|country/],
  ["plate", /plaka|\bplate\b/],
  ["passport", /pasaport|passport/],
  ["address", /adres|address/],
  ["companyName", /(sirket|firma|isyeri|kurum|isveren|ticari) (adi|unvani?|ismi)|ticaret unvani|company|organi[sz]ation|employer/],
  ["jobTitle", /\bunvan|gorev|pozisyon|meslek|kadro|job title|\btitle\b|position/],
  ["department", /departman|\bbolum|\bbirim|department/],
  ["salary", /ucret|\bmaas|salary|\bbrut|\bwage|\bnet tutar/],
  ["username", /kullanici (adi|kodu)|username|user name|\blogin\b|\buser id/],
  ["password", /sifre|parola|password|\bpin\b/],
  ["gender", /cinsiyet|gender|\bsex\b/],
  ["maritalStatus", /medeni|marital/],
  ["age", /\byas\b|\bage\b/],
  ["fullName", /\bad ?soyad|adi soyadi|isim soyisim|full ?name|ad ve soyad/],
  ["lastName", /soyad|soyisim|last ?name|surname|family ?name/],
  ["firstName", /^(adi?|adiniz|isim|isminiz|ilk ad|personel adi|calisan adi|first ?name|given ?name|f ?name|name)$|first ?name|given ?name/],
  ["url", /\bweb\b|web sitesi|website|\burl\b|\bsite\b/],
  ["longText", /aciklama|\bnot(lar)?\b|description|yorum|comment|mesaj|message|notes?\b/],
];

const AUTOCOMPLETE: Record<string, FieldKind> = {
  "given-name": "firstName", "family-name": "lastName", name: "fullName",
  email: "email", tel: "phone", "tel-national": "phone", "postal-code": "postalCode",
  "address-level1": "city", "address-level2": "district", "street-address": "address",
  "address-line1": "address", bday: "birthDate", "cc-number": "creditCard",
  "cc-csc": "cvv", "cc-exp": "cardExpiry", username: "username",
  "new-password": "password", "current-password": "password",
  organization: "companyName", country: "country", "country-name": "country",
  "organization-title": "jobTitle", url: "url", sex: "gender",
};

function matchText(text: string | undefined): FieldKind | null {
  if (!text) return null;
  const n = normalizeTr(text);
  if (!n) return null;
  for (const [kind, re] of RULES) if (re.test(n)) return kind;
  return null;
}

/**
 * Alan türünü bul. Önce görünen etiket, sonra placeholder, sonra name/id;
 * hiçbiri tutmazsa input type'a göre genel bir tür döner.
 */
export function classifyField(h: FieldHints): FieldKind {
  const type = (h.type ?? "text").toLowerCase();
  const ac = (h.autocomplete ?? "").toLowerCase().split(/\s+/).pop() ?? "";
  const fromSources =
    matchText(h.label) ??
    (AUTOCOMPLETE[ac] || null) ??
    matchText(h.placeholder) ??
    matchText(h.name) ??
    matchText(h.id);
  if (fromSources) {
    // Tür, kontrolün tipiyle çelişiyorsa tip kazanır
    if (type === "email" && !/mail|kep/i.test(fromSources)) return "email";
    if (type === "time") return "time";
    if (type === "date" && !isDateKind(fromSources)) return "date";
    return fromSources;
  }
  switch (type) {
    case "email": return "email";
    case "tel": return "phone";
    case "password": return "password";
    case "date": case "datetime-local": case "month": return "date";
    case "time": return "time";
    case "url": return "url";
    case "number": case "range": return "number";
    case "textarea": return "longText";
    default: return "text";
  }
}

export function isDateKind(k: FieldKind): boolean {
  return ["birthDate", "hireDate", "exitDate", "leaveStart", "leaveEnd", "validUntil", "date"].includes(k);
}

/** Popup ve önizleme için Türkçe ad. */
export const KIND_LABELS: Record<FieldKind, string> = {
  firstName: "Ad", lastName: "Soyad", fullName: "Ad soyad", motherName: "Anne adı",
  fatherName: "Baba adı", birthPlace: "Doğum yeri", gender: "Cinsiyet",
  maritalStatus: "Medeni hal", nationality: "Uyruk", age: "Yaş", tckn: "TC kimlik no",
  foreignId: "Yabancı kimlik no", passport: "Pasaport no", sgkNo: "SGK sicil no",
  email: "E-posta", workEmail: "İş e-postası", kepEmail: "KEP adresi",
  username: "Kullanıcı adı", password: "Şifre", phone: "Cep telefonu",
  workPhone: "İş telefonu", homePhone: "Ev telefonu", countryCode: "Ülke kodu",
  birthDate: "Doğum tarihi", hireDate: "İşe giriş tarihi", exitDate: "Çıkış tarihi",
  leaveStart: "İzin başlangıcı", leaveEnd: "İzin bitişi", validUntil: "Geçerlilik tarihi",
  date: "Tarih", time: "Saat", country: "Ülke", city: "İl", district: "İlçe",
  neighborhood: "Mahalle", avenue: "Cadde", street: "Sokak", buildingNo: "Bina no",
  apartmentNo: "Daire no", postalCode: "Posta kodu", address: "Adres", plate: "Plaka",
  companyName: "Şirket unvanı", vkn: "Vergi kimlik no", mersis: "MERSİS no",
  taxOffice: "Vergi dairesi", sgkWorkplaceNo: "SGK işyeri sicili", nace: "NACE kodu",
  jobTitle: "Görev / unvan", department: "Departman", salary: "Ücret", iban: "IBAN",
  creditCard: "Kart no", cvv: "CVV", cardExpiry: "Son kullanma", url: "Web adresi",
  number: "Sayı", longText: "Açıklama", text: "Metin",
};
