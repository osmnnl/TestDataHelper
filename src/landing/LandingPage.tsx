import React from "react";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <img src="/icons/icon48.png" alt="Logo" />
            <span>Test Data Helper</span>
          </div>
          <nav>
            <a href="#features">Özellikler</a>
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
          <h1>
            Test Verilerinizi <span className="highlight">Işık Hızında</span>{" "}
            Üretin
          </h1>
          <p>
            Yazılım geliştirme ve test süreçleri için ihtiyacınız olan tüm
            veriler tek tıkla elinizin altında. Güvenli, hızlı ve tamamen yerel.
          </p>
          <div className="hero-actions">
            <a
              href="https://github.com/osmnnl/TestDataHelper"
              className="btn btn-primary"
            >
              Ücretsiz Kurun
            </a>
            <a
              href="https://github.com/osmnnl/TestDataHelper"
              className="btn btn-secondary"
            >
              GitHub'da İncele
            </a>
          </div>
        </div>
      </section>

      {/* Stats/Features Preview */}
      <section id="features" className="features-grid">
        <div className="feature-card">
          <div className="icon">🛡️</div>
          <h3>Tamamen Güvenli</h3>
          <p>Veriler tarayıcınızda üretilir, hiçbir yere aktarılmaz.</p>
        </div>
        <div className="feature-card">
          <div className="icon">⚡</div>
          <h3>Işık Hızında</h3>
          <p>Tek tıkla kopyalayın, beklemeden testlerinize devam edin.</p>
        </div>
        <div className="feature-card">
          <div className="icon">🎨</div>
          <h3>Modern Arayüz</h3>
          <p>Shadcn UI esintili, kullanıcı dostu ve şık tasarım.</p>
        </div>
      </section>

      {/* Data Types */}
      <section className="data-types">
        <h2>Üretilebilen Veriler</h2>
        <div className="type-tags">
          <span>TCKN</span>
          <span>IBAN</span>
          <span>Telefon</span>
          <span>Ad Soyad</span>
          <span>Adres</span>
          <span>E-posta</span>
          <span>Vergi No</span>
          <span>SGK No</span>
          <span>Lorem Ipsum</span>
        </div>
      </section>

      {/* How to Install */}
      <section id="install" className="install-section">
        <h2>Nasıl Kurulur?</h2>
        <div className="install-cards">
          <div className="install-card chrome">
            <h3>Chrome Web Store</h3>
            <p>Resmi mağaza üzerinden tek tıkla kurulum (Çok yakında).</p>
            <button disabled className="btn btn-muted">
              Yakında
            </button>
          </div>
          <div className="install-card developer">
            <h3>Geliştirici Modu</h3>
            <p>GitHub üzerinden indirerek hemen kullanmaya başlayın.</p>
            <a
              href="https://github.com/osmnnl/TestDataHelper"
              className="btn btn-success"
            >
              Talimatları Gör
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          © 2026 Test Data Helper.{" "}
          <a href="https://github.com/osmnnl" target="_blank" rel="noreferrer">
            osmnnl
          </a>{" "}
          tarafından geliştirildi.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
