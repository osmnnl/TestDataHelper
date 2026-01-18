# Data Helper 🚀

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-v1.0-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli)

Data Helper, yazılım geliştirme ve test süreçlerini hızlandırmak için tasarlanmış, modern ve minimalist bir Chrome uzantısıdır. Tek tıkla veya **sağ tık menüsü** ile gerçekçi test verileri (TCKN, IBAN, SGK, E-posta vb.) üretir.

## ✨ Özellikler

- **🔒 %100 Güvenli**: Veriler tamamen yerel olarak tarayıcınızda üretilir
- **🖱️ Sağ Tık Menüsü**: Herhangi bir input'a sağ tıklayın → Data Helper → istediğiniz veriyi seçin
- **⚡️ Işık Hızında**: Tek tıkla kopyala-yapıştır kolaylığı
- **⭐ Favoriler**: En çok kullandığınız veri tiplerini favorilerinize sabitleyin
- **🎨 Premium UI**: Karanlık mod desteği ve modern tasarım

## 📦 Veri Tipleri

| 💳 Finansal     | 👤 Kişisel   | 📝 Metin     |
| --------------- | ------------ | ------------ |
| TC Kimlik No    | Ad Soyad     | 50 Karakter  |
| Vergi Kimlik No | E-posta      | 100 Karakter |
| IBAN            | Telefon      | 250 Karakter |
| SGK Sicil No    | Doğum Tarihi | 500 Karakter |
| SMMM Sicil No   | Tam Adres    |              |

## 🛠 Kurulum

### Chrome Web Store (Önerilen)

[**Chrome Web Store'dan Yükle →**](https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli)

### Geliştirici Modu

```bash
git clone https://github.com/osmnnl/TestDataHelper.git
cd TestDataHelper
npm install
npm run build
```

1. Chrome'da `chrome://extensions/` açın
2. "Geliştirici Modu" aktif edin
3. "Paketlenmemiş öğe yükle" → `/dist` klasörünü seçin

## 🖱️ Sağ Tık Menüsü Kullanımı

1. Herhangi bir web sitesinde bir input alanına sağ tıklayın
2. **Data Helper** menüsünü seçin
3. Kategori seçin (Finansal, Kişisel, Metin)
4. İstediğiniz veri tipini seçin
5. Input otomatik olarak dolar! ✓

## 💻 Teknolojiler

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS (Modern Design System)
- **Extension**: Chrome Manifest V3

## 📄 Lisans

MIT License - [osmanunal](https://github.com/osmanunal)
