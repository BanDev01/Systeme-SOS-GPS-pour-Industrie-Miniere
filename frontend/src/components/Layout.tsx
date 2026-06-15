import { Link, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>🚨 SOS GPS - Centre de Contrôle</h1>
          <nav className="nav">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link 
              to="/alerts" 
              className={location.pathname === '/alerts' ? 'active' : ''}
            >
              Alertes
            </Link>
            <Link
              to="/workers"
              className={location.pathname === '/workers' ? 'active' : ''}
            >
              Travailleurs
            </Link>
            <Link
              to="/contacts"
              className={location.pathname === '/contacts' ? 'active' : ''}
            >
              Contacts d'urgence
            </Link>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

