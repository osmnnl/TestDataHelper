# Test Data Helper 🚀

> **Coming Soon to the Chrome Web Store!** 🌟

Data Helper, yazılım geliştirme ve test süreçlerini hızlandırmak için tasarlanmış, modern ve minimalist bir Chrome uzantısıdır. Tek tıkla gerçekçi test verileri (TCKN, IBAN, SGK, E-posta vb.) üreterek iş akışınızı kesintisiz sürdürmenizi sağlar.

![Data Helper Banner](https://via.placeholder.com/800x400?text=Data+Helper+Premium+UI)

## ✨ Neden Data Helper?

ERP, İK ve Finans projelerinde çalışırken sürekli ihtiyaç duyulan "geçerli" test verilerini üretmek artık saniyeler sürüyor. Shadcn UI estetiği ile tasarlanan arayüzü sayesinde hem şık hem de son derece hızlı bir deneyim sunar.

### 🛡 Özellikler

- **🔒 %100 Güvenli**: Veriler tamamen yerel olarak tarayıcınızda üretilir. Hiçbir veri dışarı aktarılmaz veya kaydedilmez.
- **🎨 Modern & Premium UI**: Karanlık mod desteği ve Shadcn UI esintili minimalist tasarım.
- **⚡️ Işık Hızında**: Tek tıkla kopyala-yapıştır kolaylığı.
- **⭐ Favoriler**: En çok kullandığınız veri tiplerini favorilerinize sabitleyin.

## 📦 Üretilebilen Veri Tipleri

| Finansal        | Kişisel      | Metin             |
| :-------------- | :----------- | :---------------- |
| TCKN            | Ad Soyad     | Rastgele Cümleler |
| Vergi Kimlik No | E-posta      | Lorem Ipsum       |
| IBAN            | Telefon      | Kullanıcı Adı     |
| SGK Sicil No    | Doğum Tarihi | ...               |
|                 | Tam Adres    |                   |

## 🛠 Kurulum (Beta / Geliştirici Modu)

Uygulama henüz Chrome Web Store'da onay sürecindedir. Şimdilik manuel olarak yükleyebilirsiniz:

1. Bu depoyu klonlayın: `git clone https://github.com/osmnnl/TestDataHelper.git`
2. Bağımlılıkları yükleyin: `npm install`
3. Üretim sürümünü oluşturun: `npm run build`
4. Chrome'da `chrome://extensions/` sayfasını açın.
5. **"Geliştirici Modu"**nu aktif hale getirin.
6. **"Paketlenmemiş öğe yükle"** diyerek projedeki `/dist` klasörünü seçin.

## 📅 Yol Haritası

- [ ] Chrome Web Store Yayını (Yakında!)
- [ ] Daha fazla veri tipi (Passport No, Kredi Kartı vb.)
- [ ] Çoklu dil desteği (English, German)
- [ ] Export (JSON/CSV) özellikleri

## 💻 Teknolojiler

- **Frontend**: React, TypeScript, Vite
- **Styling**: Vanilla CSS (Modern Design System)
- **State Management**: React Hooks & Storage API

## 📄 Lisans

Bu proje MIT lisansı altında korunmaktadır.
