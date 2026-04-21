# Gizlilik Politikası - Data Helper

**Son güncelleme:** 21 Nisan 2026

## Genel Bakış

Data Helper, yazılım test süreçlerinde kullanılmak üzere sahte (fake) veri üreten bir Chrome uzantısıdır. Kullanıcı gizliliğini en üst düzeyde önemsiyoruz.

## Veri Toplama

Data Helper uzantısı **hiçbir kişisel veri toplamaz, saklamaz veya üçüncü taraflarla paylaşmaz.**

Uzantımız:
- ❌ Kişisel bilgilerinizi toplamaz
- ❌ Tarama geçmişinizi izlemez
- ❌ Hiçbir sunucuya veri göndermez
- ❌ Analitik veya izleme araçları kullanmaz
- ❌ Üçüncü taraf servislerle iletişim kurmaz
- ❌ Sayfalarınıza kalıcı content-script enjekte etmez

## Yerel Depolama

Uzantı yalnızca aşağıdaki bilgileri **yerel olarak (cihazınızda)** saklar:

- Favori olarak işaretlediğiniz veri tipleri ve sıralaması
- Kullanıcı ayarları (tema, tercih edilen banka vb.)
- Son üretilen değerlerin oturum geçmişi (`chrome.storage.session`; tarayıcıyı kapatınca silinir)
- Aktif "Persona" (oturum boyunca kalıcı; tarayıcıyı kapatınca silinir)

Favori ve ayarlar öncelikli olarak `chrome.storage.sync` ile (aynı Google hesabıyla giriş yaptığınız diğer Chrome cihazlarıyla senkronize olur), kota dolarsa `chrome.storage.local`'a düşerek saklanır. Hiçbiri Data Helper'ın kendi sunucularına gönderilmez; senkronizasyon tamamen Google altyapısı üzerinden gerçekleşir.

## Kullanılan İzinler

| İzin | Kullanım Amacı |
|------|----------------|
| `storage` | Favori, ayar ve oturum geçmişini yerel olarak saklamak için |
| `contextMenus` | Sağ-tık menüsüne "Data Helper" girdisini eklemek için |
| `activeTab` | Sağ-tık menüsü tıklandığında, yalnızca o sekmenin aktif input'una veri yazmak için — kullanıcı eylemiyle tetiklenir ve başka sekmelerdeki içeriğe erişim sağlamaz |
| `scripting` | Sağ-tık tetiklendiğinde ilgili sekmeye tek seferlik, üretilen değeri yazan ince bir fonksiyon enjekte etmek için |

Önceki sürümlerde kullanılan kalıcı `<all_urls>` content-script kaldırıldı. Artık hiçbir sayfaya uzantı arka planda yüklenmiyor — yalnızca sağ-tık + menü seçimi ile, o anki sekmeye, tek seferlik bir doldurma fonksiyonu enjekte ediliyor.

## Üretilen Veriler Hakkında

Uzantının ürettiği tüm veriler (TCKN, IBAN, telefon numarası, kredi kartı numarası vb.) **tamamen rastgele ve sahte**dir. Bu veriler:
- Gerçek kişilere veya hesaplara ait değildir
- Matematiksel algoritmalara göre geçerli formatta (Luhn, mod97 vb.) üretilir
- Yalnızca test amaçlı kullanılmalıdır
- Gerçek işlemlerde (bankacılık, resmi başvuru vb.) kullanılmamalıdır

## Çocukların Gizliliği

Bu uzantı çocuklara yönelik değildir ve 13 yaşın altındaki çocuklardan bilerek veri toplamaz.

## Değişiklikler

Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda CHANGELOG / sürüm notları üzerinden bilgilendirme yapılacaktır.

## İletişim

Gizlilik politikası hakkında sorularınız için GitHub üzerinden issue açabilirsiniz:
https://github.com/osmnnl/TestDataHelper/issues

---

*Bu uzantı açık kaynaklıdır ve kaynak kodu GitHub'da incelenebilir.*
