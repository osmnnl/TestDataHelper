/**
 * 81 il: plaka kodu, il adı ve birkaç ilçe (posta kodu ile).
 * Posta kodunun ilk iki hanesi her zaman ilin plaka kodudur; büyük ilçelerin
 * kodları gerçek, diğerleri aynı kalıpta temsili değerlerdir (test verisi).
 */

export interface District {
  name: string;
  postalCode: string;
}

export interface Province {
  plate: string;
  name: string;
  districts: District[];
}

// "plaka|İl|İlçe:posta,İlçe:posta"
const RAW = [
  "01|Adana|Seyhan:01060,Çukurova:01170,Yüreğir:01250,Sarıçam:01225",
  "02|Adıyaman|Merkez:02000,Kahta:02400,Besni:02300",
  "03|Afyonkarahisar|Merkez:03000,Sandıklı:03500,Bolvadin:03300",
  "04|Ağrı|Merkez:04000,Doğubayazıt:04400,Patnos:04500",
  "05|Amasya|Merkez:05000,Merzifon:05300,Suluova:05500",
  "06|Ankara|Çankaya:06690,Keçiören:06280,Yenimahalle:06170,Etimesgut:06790",
  "07|Antalya|Muratpaşa:07100,Konyaaltı:07070,Kepez:07320,Alanya:07400",
  "08|Artvin|Merkez:08000,Hopa:08600,Arhavi:08200",
  "09|Aydın|Efeler:09010,Kuşadası:09400,Nazilli:09800,Didim:09270",
  "10|Balıkesir|Altıeylül:10100,Karesi:10010,Bandırma:10200,Edremit:10300",
  "11|Bilecik|Merkez:11000,Bozüyük:11300,Osmaneli:11500",
  "12|Bingöl|Merkez:12000,Genç:12500,Solhan:12600",
  "13|Bitlis|Merkez:13000,Tatvan:13200,Ahlat:13400",
  "14|Bolu|Merkez:14000,Gerede:14900,Mengen:14800",
  "15|Burdur|Merkez:15000,Bucak:15300,Gölhisar:15400",
  "16|Bursa|Nilüfer:16110,Osmangazi:16040,Yıldırım:16310,İnegöl:16400",
  "17|Çanakkale|Merkez:17000,Biga:17200,Gelibolu:17500",
  "18|Çankırı|Merkez:18000,Çerkeş:18600,Ilgaz:18700",
  "19|Çorum|Merkez:19000,Sungurlu:19300,Osmancık:19500",
  "20|Denizli|Pamukkale:20160,Merkezefendi:20010,Çivril:20600",
  "21|Diyarbakır|Bağlar:21080,Kayapınar:21070,Yenişehir:21100,Ergani:21500",
  "22|Edirne|Merkez:22000,Keşan:22800,Uzunköprü:22200",
  "23|Elazığ|Merkez:23000,Kovancılar:23600,Karakoçan:23500",
  "24|Erzincan|Merkez:24000,Tercan:24800,Üzümlü:24500",
  "25|Erzurum|Yakutiye:25030,Palandöken:25070,Aziziye:25200,Horasan:25700",
  "26|Eskişehir|Tepebaşı:26130,Odunpazarı:26010,Sivrihisar:26600",
  "27|Gaziantep|Şahinbey:27010,Şehitkamil:27060,Nizip:27700",
  "28|Giresun|Merkez:28000,Bulancak:28300,Espiye:28600",
  "29|Gümüşhane|Merkez:29000,Kelkit:29600,Şiran:29700",
  "30|Hakkari|Merkez:30000,Yüksekova:30300,Şemdinli:30700",
  "31|Hatay|Antakya:31060,İskenderun:31200,Dörtyol:31600,Defne:31160",
  "32|Isparta|Merkez:32000,Eğirdir:32500,Yalvaç:32400",
  "33|Mersin|Yenişehir:33110,Mezitli:33200,Tarsus:33400,Erdemli:33730",
  "34|İstanbul|Kadıköy:34710,Beşiktaş:34353,Üsküdar:34660,Şişli:34360,Bakırköy:34142,Ataşehir:34750",
  "35|İzmir|Bornova:35040,Karşıyaka:35560,Konak:35250,Buca:35390,Çiğli:35620",
  "36|Kars|Merkez:36000,Sarıkamış:36500,Kağızman:36700",
  "37|Kastamonu|Merkez:37000,Tosya:37800,Taşköprü:37400",
  "38|Kayseri|Melikgazi:38030,Kocasinan:38090,Talas:38280",
  "39|Kırklareli|Merkez:39000,Lüleburgaz:39750,Babaeski:39200",
  "40|Kırşehir|Merkez:40000,Kaman:40300,Mucur:40500",
  "41|Kocaeli|İzmit:41040,Gebze:41400,Darıca:41700,Gölcük:41650",
  "42|Konya|Selçuklu:42250,Meram:42090,Karatay:42030,Ereğli:42300",
  "43|Kütahya|Merkez:43000,Tavşanlı:43300,Simav:43500",
  "44|Malatya|Battalgazi:44070,Yeşilyurt:44900,Doğanşehir:44500",
  "45|Manisa|Yunusemre:45030,Şehzadeler:45020,Akhisar:45200,Turgutlu:45400",
  "46|Kahramanmaraş|Onikişubat:46040,Dulkadiroğlu:46050,Elbistan:46300",
  "47|Mardin|Artuklu:47100,Kızıltepe:47400,Midyat:47500",
  "48|Muğla|Menteşe:48000,Bodrum:48400,Fethiye:48300,Marmaris:48700",
  "49|Muş|Merkez:49000,Bulanık:49500,Malazgirt:49400",
  "50|Nevşehir|Merkez:50000,Ürgüp:50400,Avanos:50500",
  "51|Niğde|Merkez:51000,Bor:51700,Ulukışla:51900",
  "52|Ordu|Altınordu:52200,Ünye:52300,Fatsa:52400",
  "53|Rize|Merkez:53000,Çayeli:53200,Ardeşen:53400",
  "54|Sakarya|Adapazarı:54100,Serdivan:54050,Hendek:54300",
  "55|Samsun|İlkadım:55030,Atakum:55200,Canik:55080,Bafra:55400",
  "56|Siirt|Merkez:56000,Kurtalan:56500,Pervari:56600",
  "57|Sinop|Merkez:57000,Boyabat:57200,Gerze:57600",
  "58|Sivas|Merkez:58000,Şarkışla:58400,Suşehri:58600",
  "59|Tekirdağ|Süleymanpaşa:59100,Çorlu:59850,Çerkezköy:59500",
  "60|Tokat|Merkez:60000,Erbaa:60500,Turhal:60300",
  "61|Trabzon|Ortahisar:61030,Akçaabat:61300,Of:61830,Yomra:61250",
  "62|Tunceli|Merkez:62000,Pertek:62500,Ovacık:62400",
  "63|Şanlıurfa|Haliliye:63050,Eyyübiye:63040,Siverek:63600,Viranşehir:63700",
  "64|Uşak|Merkez:64000,Banaz:64500,Eşme:64600",
  "65|Van|İpekyolu:65100,Tuşba:65050,Erciş:65400,Edremit:65150",
  "66|Yozgat|Merkez:66000,Sorgun:66700,Yerköy:66900",
  "67|Zonguldak|Merkez:67000,Ereğli:67300,Çaycuma:67900",
  "68|Aksaray|Merkez:68000,Ortaköy:68400,Eskil:68800",
  "69|Bayburt|Merkez:69000,Demirözü:69500,Aydıntepe:69400",
  "70|Karaman|Merkez:70000,Ermenek:70400,Sarıveliler:70600",
  "71|Kırıkkale|Merkez:71000,Yahşihan:71450,Keskin:71300",
  "72|Batman|Merkez:72000,Kozluk:72400,Sason:72500",
  "73|Şırnak|Merkez:73000,Cizre:73200,Silopi:73400",
  "74|Bartın|Merkez:74000,Amasra:74300,Ulus:74600",
  "75|Ardahan|Merkez:75000,Göle:75700,Posof:75800",
  "76|Iğdır|Merkez:76000,Tuzluca:76900,Aralık:76400",
  "77|Yalova|Merkez:77000,Çınarcık:77300,Altınova:77700",
  "78|Karabük|Merkez:78000,Safranbolu:78600,Eskipazar:78400",
  "79|Kilis|Merkez:79000,Musabeyli:79600,Elbeyli:79300",
  "80|Osmaniye|Merkez:80000,Kadirli:80750,Düziçi:80600",
  "81|Düzce|Merkez:81000,Akçakoca:81650,Kaynaşlı:81900",
];

export const PROVINCES: readonly Province[] = RAW.map((line) => {
  const [plate, name, list] = line.split("|");
  return {
    plate,
    name,
    districts: list.split(",").map((d) => {
      const [dn, postalCode] = d.split(":");
      return { name: dn, postalCode };
    }),
  };
});

/** Ağırlıklı seçim için büyük iller (test verisinde daha sık görünsün). */
export const MAJOR_PLATES = ["34", "06", "35", "16", "07", "01", "41", "42", "27", "55"];
