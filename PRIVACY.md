# Gizlilik Politikası · Data Helper

**Son güncelleme:** 4 Kasım 2026 · sürüm 2.0.0

*English version below.*

## Kısaca

Data Helper hiçbir kişisel veri toplamaz, hiçbir sunucuya veri göndermez, analitik ya da izleme kullanmaz. Ürettiği her değer sahte test verisidir. Her şey tarayıcınızda çalışır.

## Saklanan bilgiler

Data Helper yalnız şunları, yalnız sizin tarayıcınızda saklar:

| Ne | Nerede | Ne zaman silinir |
|----|--------|------------------|
| Geçerli kişi ve şirket (sahte), kilit durumu | `chrome.storage.local` | Eklentiyi kaldırınca ya da "Yeni" deyince |
| Favoriler ve ayarlar (tema, gizli siteler) | `chrome.storage.sync`; kota dolarsa `chrome.storage.local` | Eklentiyi kaldırınca |
| Toplu dosya şablonları | `chrome.storage.local` | Eklentiyi kaldırınca |
| Son kopyalananlar ve son doldurma özeti (geri alma için) | `chrome.storage.session` | Tarayıcı kapanınca |

`chrome.storage.sync` kullanıldığında favori ve ayarlarınız, aynı Google hesabıyla oturum açtığınız Chrome'lar arasında Google tarafından eşitlenir. Data Helper'ın kendi sunucusu yoktur.

Data Helper doldurduğu sayfalardaki içeriği okumaz, kaydetmez, göndermez. Formu doldururken yalnız alan etiketlerine bakarak hangi alana ne yazılacağına karar verir; bu bilgi sayfadan çıkmaz.

## İzinler

| İzin | Neden |
|------|-------|
| `activeTab` | Siz istediğinizde (düğme, kısayol, sağ tık) yalnız kullandığınız sekmedeki formu doldurmak |
| `scripting` | Doldurma motorunu o sekmeye o an, tek seferlik yüklemek. Uzak kod çalıştırılmaz; motor eklenti paketinin içindedir |
| `storage` | Yukarıdaki tablodaki bilgileri saklamak |
| `contextMenus` | Sağ tık menüsüne "Data Helper" girdisini eklemek |
| `sidePanel` | Data Helper'ı yan panelde açabilmek |
| `<all_urls>` (isteğe bağlı) | Yalnız yan panelden doldurmak istediğinizde, o site için ayrıca sorulur. Vermezseniz eklenti yine çalışır |

Data Helper hiçbir sayfaya arka planda kalıcı betik yüklemez.

## Üretilen veriler

TCKN, VKN, IBAN, telefon, kart numarası gibi tüm değerler rastgele ve sahtedir; gerçek kişilere ya da hesaplara ait değildir. Biçim ve sağlama kurallarına uyarlar ama yalnız test için kullanılmalıdır.

## İletişim

Sorular için: https://github.com/osmnnl/TestDataHelper/issues

Data Helper açık kaynaklıdır: https://github.com/osmnnl/TestDataHelper

---

# Privacy Policy · Data Helper

**Last updated:** 4 November 2026 · version 2.0.0

## In short

Data Helper collects no personal data, sends nothing to any server and uses no analytics or tracking. Every value it produces is fake test data. Everything runs in your browser.

## What is stored

| What | Where | Removed when |
|------|-------|--------------|
| The current (fake) person and company, lock state | `chrome.storage.local` | You uninstall or press "New" |
| Favorites and settings (theme, hidden sites) | `chrome.storage.sync`; `chrome.storage.local` if the quota is full | You uninstall |
| Bulk export templates | `chrome.storage.local` | You uninstall |
| Recently copied values and the last fill summary (for Undo) | `chrome.storage.session` | The browser closes |

With `chrome.storage.sync`, Google syncs your favorites and settings between the Chrome browsers signed in to the same Google account. Data Helper has no server of its own.

Data Helper does not read, store or send the content of the pages it fills. It looks at field labels to decide what goes into each field; that information never leaves the page.

## Permissions

| Permission | Why |
|------------|-----|
| `activeTab` | Fill the form in the tab you are using, only when you ask (button, shortcut, right-click) |
| `scripting` | Load the fill engine into that tab once, at that moment. No remote code; the engine ships inside the extension |
| `storage` | Keep the items in the table above |
| `contextMenus` | Add the "Data Helper" right-click menu |
| `sidePanel` | Open Data Helper in the side panel |
| `<all_urls>` (optional) | Asked separately, per site, only when you fill from the side panel. The extension works without it |

Data Helper never runs persistent scripts in the background of any page.

## Generated data

All values (TCKN, VKN, IBAN, phone, card numbers and so on) are random and fake and belong to no real person or account. They follow format and checksum rules but are for testing only.

## Contact

Questions: https://github.com/osmnnl/TestDataHelper/issues

Data Helper is open source: https://github.com/osmnnl/TestDataHelper
