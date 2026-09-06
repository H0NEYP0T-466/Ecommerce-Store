import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import './NotFound.css';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Hamid Cloth House</title>
      </Helmet>

      <div className="notfound-page">
        <div className="notfound-content">
          <span className="notfound-code">404</span>
          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-desc">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="notfound-actions">
            <Link to="/">
              <Button variant="primary" size="lg">
                <Home size={18} /> Go Home
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="secondary" size="lg">
                <ArrowLeft size={18} /> Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
