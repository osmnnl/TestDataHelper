# Gizlilik Politikası - Data Helper

**Son güncelleme:** 15 Ocak 2026

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

## Yerel Depolama

Uzantı yalnızca aşağıdaki bilgileri **yerel olarak (cihazınızda)** saklar:

- Favori olarak işaretlediğiniz üretilen test verileri

Bu veriler yalnızca tarayıcınızın yerel depolama alanında (`chrome.storage.local`) tutulur ve:
- Hiçbir sunucuya gönderilmez
- Şifrelenmez (çünkü zaten sahte/test verileridir)
- Uzantıyı kaldırdığınızda silinir

## Kullanılan İzinler

| İzin | Kullanım Amacı |
|------|----------------|
| `storage` | Favori verilerinizi yerel olarak saklamak için kullanılır |

## Üretilen Veriler Hakkında

Uzantının ürettiği tüm veriler (TCKN, IBAN, telefon numarası vb.) **tamamen rastgele ve sahte**dir. Bu veriler:
- Gerçek kişilere ait değildir
- Matematiksel algoritmalara göre geçerli formatta üretilir
- Yalnızca test amaçlı kullanılmalıdır

## Çocukların Gizliliği

Bu uzantı çocuklara yönelik değildir ve 13 yaşın altındaki çocuklardan bilerek veri toplamaz.

## Değişiklikler

Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda kullanıcılar bilgilendirilecektir.

## İletişim

Gizlilik politikası hakkında sorularınız için GitHub üzerinden issue açabilirsiniz:
https://github.com/AltanErsworworke/TestDataHelper/issues

---

*Bu uzantı açık kaynaklıdır ve kaynak kodu GitHub'da incelenebilir.*
