import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-title">🚨 SOS GPS</p>
          <p className="footer-subtitle">Système de sécurité et d'alerte d'urgence</p>
        </div>
        <div className="footer-section">
          <p className="footer-info">Industrie Minière</p>
          <p className="footer-location">République Démocratique du Congo</p>
        </div>
        <div className="footer-section">
          <p className="footer-copyright">
            © {currentYear} SOS GPS. Tous droits réservés.
          </p>
          <p className="footer-version">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};



