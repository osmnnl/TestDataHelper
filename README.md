# Data Helper - Chrome Extension

<div align="center">
  <img src="public/icons/icon128.png" alt="Data Helper" width="128" height="128">
  <h3>Test Data Generator for Chrome Browser</h3>
  <p>Generate realistic test data instantly - TCKN, IBAN, Phone, Email & more</p>
  
  <p>
    <a href="https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli" target="_blank">
      <img src="https://img.shields.io/badge/🚀_Install-Chrome_Web_Store-green?style=for-the-badge&logo=google-chrome" alt="Install from Chrome Web Store">
    </a>
    <a href="https://osmnnl.github.io/TestDataHelper/" target="_blank">
      <img src="https://img.shields.io/badge/🌐_Visit-Website-blue?style=for-the-badge&logo=github-pages" alt="Visit Website">
    </a>
    <a href="https://github.com/osmnnl/TestDataHelper" target="_blank">
      <img src="https://img.shields.io/badge/⭐_Star-Repository-yellow?style=for-the-badge&logo=github" alt="Star Repository">
    </a>
  </p>
  
  <p>
    <strong>🚀 <a href="https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli" target="_blank">Install Now from Chrome Web Store</a></strong>
  </p>
</div>

## 📋 Features

- **Right-Click Context Menu**: Right-click any input → Data Helper → Select data type
- **100% Secure**: All data generated locally in your browser
- **Lightning Fast**: One-click copy-paste convenience
- **Favorites**: Pin frequently used data types
- **Premium UI**: Dark mode support with modern design

## 📦 Supported Data Types

| 💳 Financial    | 👤 Personal  | 📝 Text        |
| --------------- | ------------ | -------------- |
| TC Kimlik No    | Name Surname | 50 Characters  |
| Vergi Kimlik No | Email        | 100 Characters |
| IBAN            | Phone        | 250 Characters |
| SGK Sicil No    | Birth Date   | 500 Characters |
| SMMM Sicil No   | Full Address |                |

## 🚀 Installation

### Install from Chrome Web Store

🎉 **Data Helper is now live on Chrome Web Store!**

**[👉 Install Data Helper](https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli)**

Simply click the link above and hit "Add to Chrome" to install the extension instantly.

### Manual Installation (Developer Mode)

1. Clone and build: `git clone https://github.com/osmnnl/TestDataHelper.git && cd TestDataHelper && npm install && npm run build`
2. Go to `chrome://extensions/` and enable **Developer mode**
3. Click **Load unpacked** and select the `dist` folder

## 📖 Usage

### Context Menu (Right-Click)

1. Right-click on any input field
2. Select **Data Helper** from the menu
3. Choose category (Financial, Personal, Text)
4. Select desired data type
5. Input is automatically filled! ✓

### Popup Interface

Click the Data Helper icon in the browser toolbar to:

- Generate and copy data instantly
- Manage favorites
- Access all data types

## ⚙️ Technical Details

### Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS (Modern Design System)
- **Extension**: Chrome Manifest V3

### Permissions

- `activeTab` - Access only the currently active tab
- `contextMenus` - Right-click menu integration
- `scripting` - Auto-fill input fields

## 🔒 Security

- All data is generated locally
- No data is sent to external servers
- No tracking or analytics

## 📝 License

This project is released under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'New feature: description'`)
4. Push your branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 🐛 Bug Reports

Use the [Issues](https://github.com/osmnnl/TestDataHelper/issues) page for bugs or suggestions.

## 📞 Contact

- **Developer**: [GitHub Profile](https://github.com/osmnnl)
- **Email**: osmnnldev@gmail.com

---

<div align="center">
  <p>⭐ Don't forget to star the project if you liked it!</p>
</div>
