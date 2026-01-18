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
              href="https://github.com/osmanunal/TestDataHelper"
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
              href="https://github.com/osmanunal/TestDataHelper"
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
              href="https://github.com/osmanunal/TestDataHelper"
              className="btn btn-secondary"
            >
              GitHub'dan İndir
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>
            © 2026 Data Helper.{" "}
            <a
              href="https://github.com/osmanunal"
              target="_blank"
              rel="noreferrer"
            >
              osmanunal
            </a>{" "}
            tarafından tutkuyla geliştirildi.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
