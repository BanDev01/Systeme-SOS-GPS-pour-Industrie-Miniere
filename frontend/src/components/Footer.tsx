import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <span className="footer-brand">⛏ SOS GPS</span>
      <span className="footer-status">
        <span className="status-dot" />
        Système opérationnel
      </span>
      <span className="footer-meta">v1.0.0 &nbsp;·&nbsp; © {currentYear} SOS GPS</span>
    </footer>
  );
};
