import "./LandingPage.css";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli";

function LandingPage() {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <img src="icons/icon48.png" alt="Logo" />
            <span>Data Helper</span>
          </div>
          <nav>
            <a href="#features">Özellikler</a>
            <a href="#data-types">Veri Tipleri</a>
            <a href="#install">Kurulum</a>
            <a
              href="https://github.com/osmnnl/TestDataHelper"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎉 Chrome Web Store'da Yayında!</div>
          <h1>
            Test Verilerinizi <br />
            <span className="highlight">Işık Hızında</span> Üretin
          </h1>
          <p>
            Popup veya <strong>sağ tık menüsü</strong> ile ihtiyacınız olan tüm
            test verileri elinizin altında. Güvenli, hızlı ve tamamen yerel.
          </p>
          <div className="hero-actions">
            <a href={CHROME_STORE_URL} className="btn btn-primary">
              <span>Chrome'a Ekle</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </a>
            <a
              href="https://github.com/osmnnl/TestDataHelper"
              className="btn btn-secondary"
            >
              <span>GitHub'da İncele</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-grid">
        <div className="feature-card">
          <div className="icon">🖱️</div>
          <h3>Sağ Tık Menüsü</h3>
          <p>
            Herhangi bir input'a sağ tıklayın, Data Helper menüsünden
            istediğiniz veriyi seçin ve input otomatik dolsun.
          </p>
        </div>
        <div className="feature-card">
          <div className="icon">🛡️</div>
          <h3>Tamamen Güvenli</h3>
          <p>
            Veriler tamamen yerel olarak tarayıcınızda üretilir. Hiçbir veri
            dışarı aktarılmaz veya kaydedilmez.
          </p>
        </div>
        <div className="feature-card">
          <div className="icon">⚡</div>
          <h3>Işık Hızında</h3>
          <p>
            Karmaşık test verilerini saniyeler içinde üretin ve tek tıkla
            kopyalayın. İş akışınızı asla bölmeyin.
          </p>
        </div>
      </section>

      {/* Supported Data Types */}
      <section id="data-types" className="data-types">
        <h2>Kapsamlı Veri Kütüphanesi</h2>
        <div className="type-tags">
          <div className="type-tag">
            <span>💳</span>
            <span>TCKN / VKN</span>
          </div>
          <div className="type-tag">
            <span>🏦</span>
            <span>IBAN Üretici</span>
          </div>
          <div className="type-tag">
            <span>📱</span>
            <span>Telefon No</span>
          </div>
          <div className="type-tag">
            <span>👤</span>
            <span>Ad Soyad</span>
          </div>
          <div className="type-tag">
            <span>📍</span>
            <span>Rastgele Adres</span>
          </div>
          <div className="type-tag">
            <span>📧</span>
            <span>E-posta</span>
          </div>
          <div className="type-tag">
            <span>📜</span>
            <span>SGK Sicil No</span>
          </div>
          <div className="type-tag">
            <span>📝</span>
            <span>Metin (50-500 kar.)</span>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section id="install" className="install-section">
        <h2>Hemen Kullanmaya Başlayın</h2>
        <div className="install-cards">
          <div className="install-card chrome">
            <h3>Chrome Web Store</h3>
            <p>
              Resmi mağaza üzerinden tek tıkla kurulum yaparak güncellemeleri
              otomatik alın.
            </p>
            <a href={CHROME_STORE_URL} className="btn btn-success">
              Chrome'a Ekle
            </a>
          </div>
          <div className="install-card developer">
            <h3>Geliştirici Modu</h3>
            <p>
              Kaynak kodları indirerek kendi build'inizi oluşturun ve hemen
              kullanmaya başlayın.
            </p>
            <a
              href="https://github.com/osmnnl/TestDataHelper"
              className="btn btn-secondary"
            >
              GitHub'dan İndir
            </a>
          </div>
        </div>
      </section>

      {/* Cross Promotion Section */}
      <section className="promo-section">
        <h2>🚀 Diğer Projelerimiz</h2>
        <div className="promo-card">
          <div className="promo-logo">
            <img
              src="https://raw.githubusercontent.com/osmnnl/StorageNinja/main/icons/icon.png"
              alt="StorageNinja"
            />
            <span>
              Storage<span className="highlight-yellow">Ninja</span>
            </span>
          </div>
          <p className="promo-description">
            Chrome tarayıcınızda <strong>Local Storage</strong>,{" "}
            <strong>Session Storage</strong> ve <strong>Cookies</strong>{" "}
            verilerini kolayca yönetin. JSON desteği, toplu kopyalama/yapıştırma
            ve güvenli silme özellikleri ile geliştirici dostu arayüz.
          </p>
          <div className="promo-features">
            <span className="promo-feature">💾 Local Storage</span>
            <span className="promo-feature">⏱️ Session Storage</span>
            <span className="promo-feature">🍪 Cookies</span>
            <span className="promo-feature">📋 JSON Export</span>
          </div>
          <a
            href="https://chromewebstore.google.com/detail/storage-ninja/kenpefhgbcjkofomcfajmhmilhkfdedp"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            <span>Chrome'a Ekle</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a
              href="https://github.com/osmnnl/TestDataHelper"
              target="_blank"
              rel="noreferrer"
              title="GitHub"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="mailto:osmnnldev@gmail.com" title="Email">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>
          <p>Data Helper - Chrome Extension</p>
          <p>
            Made with ❤️ by{" "}
            <a
              href="https://github.com/osmnnl"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              osmnnl
            </a>
          </p>
          <div className="footer-privacy">
            <a
              href="https://github.com/osmnnl/TestDataHelper/blob/main/PRIVACY.md"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
